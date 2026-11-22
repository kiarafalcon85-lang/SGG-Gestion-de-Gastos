let supabaseClient = null;

function obtenerClienteSupabase() {
    if (supabaseClient) return supabaseClient;
    if (
        window.supabase &&
        SGG_CONFIG.SUPABASE_URL &&
        !SGG_CONFIG.SUPABASE_URL.includes("TU_PROYECTO") &&
        SGG_CONFIG.SUPABASE_ANON_KEY &&
        !SGG_CONFIG.SUPABASE_ANON_KEY.includes("TU_SUPABASE")
    ) {
        supabaseClient = window.supabase.createClient(
            SGG_CONFIG.SUPABASE_URL,
            SGG_CONFIG.SUPABASE_ANON_KEY
        );
    }
    return supabaseClient;
}

async function subirComprobanteAPI(file) {
    if (!SGG_CONFIG.IMGBB_API_KEY || SGG_CONFIG.IMGBB_API_KEY.includes("TU_IMGBB")) {
        throw new Error("API Key de ImgBB no configurada.");
    }

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(SGG_CONFIG.IMGBB_API_KEY)}`, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.success || !data.data || !data.data.url) {
        throw new Error("Respuesta inválida de la API externa.");
    }

    return data.data.url;
}

function obtenerRutaRemotaSQLite(email) {
    const emailLimpio = email.toLowerCase().replace(/[^a-z0-9]/g, "_");
    return `${emailLimpio}/${SGG_CONFIG.OPFS_DB_FILENAME}`;
}

async function respaldarSQLiteEnNube(email, uint8ArrayBinario) {
    const client = obtenerClienteSupabase();
    if (!client || !email || !uint8ArrayBinario) return false;

    try {
        const rutaRemota = obtenerRutaRemotaSQLite(email);
        const blobSqlite = new Blob([uint8ArrayBinario], { type: "application/x-sqlite3" });

        const { error } = await client.storage
            .from(SGG_CONFIG.SUPABASE_BUCKET)
            .upload(rutaRemota, blobSqlite, {
                contentType: "application/x-sqlite3",
                upsert: true
            });

        if (error) throw error;
        return true;
    } catch (err) {
        console.warn("Respaldo en nube omitido (modo Offline-First):", err.message);
        return false;
    }
}

async function restaurarSQLiteDesdeNube(email) {
    const client = obtenerClienteSupabase();
    if (!client || !email) return false;

    try {
        const rutaRemota = obtenerRutaRemotaSQLite(email);
        const { data, error } = await client.storage
            .from(SGG_CONFIG.SUPABASE_BUCKET)
            .download(rutaRemota);

        if (error || !data) return false;

        const arrayBuffer = await data.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        if (uint8Array.length > 0) {
            await instalarBaseDeDatosDesdeNube(uint8Array);
            return true;
        }
        return false;
    } catch (err) {
        console.warn("Sin respaldo remoto disponible:", err.message);
        return false;
    }
}
