let SQL_ENGINE = null;
let db = null;

const defaultAvatarSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239e2a4b'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.03-1.68 3.37-2.6 5.05-2.6s5.02.92 5.05 2.6C15.8 19.15 14.03 20 12 20z'/></svg>";

async function leerBinarioOPFS() {
    if (!navigator.storage || !navigator.storage.getDirectory) {
        throw new Error("El navegador no soporta OPFS nativo.");
    }
    const root = await navigator.storage.getDirectory();
    try {
        const fileHandle = await root.getFileHandle(SGG_CONFIG.OPFS_DB_FILENAME, { create: false });
        const file = await fileHandle.getFile();
        const buffer = await file.arrayBuffer();
        return new Uint8Array(buffer);
    } catch (error) {
        if (error.name === "NotFoundError") return null;
        throw error;
    }
}

async function guardarBinarioOPFS(uint8ArrayData) {
    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(SGG_CONFIG.OPFS_DB_FILENAME, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(uint8ArrayData);
    await writable.close();
}

async function persistirCambiosLocales() {
    if (!db) return null;
    const binaryArray = db.export();
    await guardarBinarioOPFS(binaryArray);
    return binaryArray;
}

async function inicializarBaseDeDatos() {
    if (!SQL_ENGINE) {
        SQL_ENGINE = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
    }

    const binarioExistente = await leerBinarioOPFS();
    if (binarioExistente && binarioExistente.length > 0) {
        db = new SQL_ENGINE.Database(binarioExistente);
        crearEsquemaSiNoExiste();
    } else {
        db = new SQL_ENGINE.Database();
        crearEsquemaSiNoExiste();
        insertarDatosIniciales();
        await persistirCambiosLocales();
    }
    return db;
}

async function instalarBaseDeDatosDesdeNube(uint8ArrayNube) {
    if (!SQL_ENGINE) {
        SQL_ENGINE = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
    }
    db = new SQL_ENGINE.Database(uint8ArrayNube);
    crearEsquemaSiNoExiste();
    await guardarBinarioOPFS(uint8ArrayNube);
}

function crearEsquemaSiNoExiste() {
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            pass TEXT NOT NULL,
            nombre TEXT NOT NULL,
            apellido TEXT NOT NULL,
            nacimiento TEXT,
            pregunta TEXT NOT NULL,
            nickname TEXT,
            avatar_url TEXT
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS movimientos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email_usuario TEXT NOT NULL,
            tipo_movimiento TEXT NOT NULL CHECK(tipo_movimiento IN ('ingreso', 'egreso')),
            monto REAL NOT NULL,
            fecha TEXT NOT NULL,
            categoria TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            url_comprobante TEXT DEFAULT NULL,
            activo INTEGER DEFAULT 1,
            FOREIGN KEY (email_usuario) REFERENCES usuarios(email)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS sesion_activa (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            email_usuario TEXT
        );
    `);
}

function insertarDatosIniciales() {
    const stmtCheck = db.prepare("SELECT COUNT(*) as total FROM usuarios");
    stmtCheck.step();
    const { total } = stmtCheck.getAsObject();
    stmtCheck.free();

    if (total === 0) {
        const stmtInsert = db.prepare(`
            INSERT INTO usuarios (email, pass, nombre, apellido, nacimiento, pregunta, nickname, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmtInsert.run(["kiarafalcon@gmail.com", "Kiarafalcon359", "Kiara", "Falcón", "2002-05-15", "Rosa", "Flutillita", defaultAvatarSvg]);
        stmtInsert.run(["admin@profesor.com", "123456", "Profesor", "Admin", "1985-01-01", "Rosa", "Profesor", defaultAvatarSvg]);
        stmtInsert.free();
    }
}

async function guardarSesionSQL(email) {
    db.run("DELETE FROM sesion_activa");
    if (email) {
        const stmt = db.prepare("INSERT INTO sesion_activa (id, email_usuario) VALUES (1, ?)");
        stmt.run([email]);
        stmt.free();
    }
    await persistirCambiosLocales();
}

function obtenerUsuarioActivoSQL() {
    const stmtSesion = db.prepare("SELECT email_usuario FROM sesion_activa WHERE id = 1");
    let emailActivo = null;
    if (stmtSesion.step()) {
        emailActivo = stmtSesion.getAsObject().email_usuario;
    }
    stmtSesion.free();
    if (!emailActivo) return null;

    const stmtUser = db.prepare("SELECT * FROM usuarios WHERE email = ?");
    stmtUser.bind([emailActivo]);
    let usuario = null;
    if (stmtUser.step()) {
        usuario = stmtUser.getAsObject();
    }
    stmtUser.free();
    return usuario;
}

function buscarUsuarioPorCredencialesSQL(email, pass) {
    const stmt = db.prepare("SELECT * FROM usuarios WHERE email = ? AND pass = ?");
    stmt.bind([email, pass]);
    let user = null;
    if (stmt.step()) {
        user = stmt.getAsObject();
    }
    stmt.free();
    return user;
}

function existeEmailSQL(email) {
    const stmt = db.prepare("SELECT id FROM usuarios WHERE email = ?");
    stmt.bind([email]);
    const existe = stmt.step();
    stmt.free();
    return existe;
}

async function registrarUsuarioSQL({ email, pass, nombre, apellido, nacimiento, pregunta }) {
    const stmt = db.prepare(`
        INSERT INTO usuarios (email, pass, nombre, apellido, nacimiento, pregunta, nickname, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([email, pass, nombre, apellido, nacimiento, pregunta, nombre, defaultAvatarSvg]);
    stmt.free();
    return await persistirCambiosLocales();
}

async function actualizarPasswordSQL(email, pregunta, newPass) {
    const stmtCheck = db.prepare("SELECT pass FROM usuarios WHERE email = ? AND LOWER(pregunta) = LOWER(?)");
    stmtCheck.bind([email, pregunta]);
    if (!stmtCheck.step()) {
        stmtCheck.free();
        return { ok: false, error: "Correo o respuesta de seguridad incorrectos." };
    }
    const { pass: oldPass } = stmtCheck.getAsObject();
    stmtCheck.free();

    if (oldPass === newPass) {
        return { ok: false, error: "La nueva contraseña no debe ser igual a la anterior." };
    }

    const stmtUpd = db.prepare("UPDATE usuarios SET pass = ? WHERE email = ?");
    stmtUpd.run([newPass, email]);
    stmtUpd.free();
    await persistirCambiosLocales();
    return { ok: true };
}

async function actualizarPerfilSQL(email, campo, valor) {
    if (campo !== "nickname" && campo !== "avatar_url") return;
    const stmt = db.prepare(`UPDATE usuarios SET ${campo} = ? WHERE email = ?`);
    stmt.run([valor, email]);
    stmt.free();
    return await persistirCambiosLocales();
}

async function insertarMovimientoSQL({ email_usuario, tipo_movimiento, monto, fecha, categoria, descripcion, url_comprobante }) {
    const stmt = db.prepare(`
        INSERT INTO movimientos (email_usuario, tipo_movimiento, monto, fecha, categoria, descripcion, url_comprobante, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);
    stmt.run([email_usuario, tipo_movimiento, monto, fecha, categoria, descripcion, url_comprobante || null]);
    stmt.free();
    return await persistirCambiosLocales();
}

async function actualizarMovimientoSQL({ id, tipo_movimiento, monto, fecha, categoria, descripcion, url_comprobante }) {
    const stmt = db.prepare(`
        UPDATE movimientos
        SET tipo_movimiento = ?, monto = ?, fecha = ?, categoria = ?, descripcion = ?, url_comprobante = ?
        WHERE id = ? AND activo = 1
    `);
    stmt.run([tipo_movimiento, monto, fecha, categoria, descripcion, url_comprobante || null, id]);
    stmt.free();
    return await persistirCambiosLocales();
}

// BORRADO LÓGICO OBLIGATORIO (UPDATE activo = 0)
async function eliminarMovimientoLogicoSQL(id) {
    const stmt = db.prepare("UPDATE movimientos SET activo = 0 WHERE id = ?");
    stmt.run([id]);
    stmt.free();
    return await persistirCambiosLocales();
}

function obtenerMovimientosActivosSQL(emailUsuario) {
    const stmt = db.prepare(`
        SELECT * FROM movimientos
        WHERE email_usuario = ? AND activo = 1
        ORDER BY fecha DESC, id DESC
    `);
    stmt.bind([emailUsuario]);
    const resultados = [];
    while (stmt.step()) {
        resultados.push(stmt.getAsObject());
    }
    stmt.free();
    return resultados;
}

function obtenerMovimientoPorIdSQL(id) {
    const stmt = db.prepare("SELECT * FROM movimientos WHERE id = ? AND activo = 1");
    stmt.bind([id]);
    let item = null;
    if (stmt.step()) {
        item = stmt.getAsObject();
    }
    stmt.free();
    return item;
}

function obtenerEgresosPorCategoriaSQL(emailUsuario) {
    const stmt = db.prepare(`
        SELECT categoria, SUM(monto) AS total
        FROM movimientos
        WHERE email_usuario = ? AND tipo_movimiento = 'egreso' AND activo = 1
        GROUP BY categoria
        ORDER BY total DESC
    `);
    stmt.bind([emailUsuario]);
    const filas = [];
    while (stmt.step()) {
        filas.push(stmt.getAsObject());
    }
    stmt.free();
    return filas;
}

function obtenerComparativaIngresosEgresosSQL(emailUsuario) {
    const stmt = db.prepare(`
        SELECT tipo_movimiento, SUM(monto) AS total
        FROM movimientos
        WHERE email_usuario = ? AND activo = 1
        GROUP BY tipo_movimiento
    `);
    stmt.bind([emailUsuario]);
    let ingresos = 0;
    let egresos = 0;
    while (stmt.step()) {
        const row = stmt.getAsObject();
        if (row.tipo_movimiento === "ingreso") ingresos = row.total || 0;
        if (row.tipo_movimiento === "egreso") egresos = row.total || 0;
    }
    stmt.free();
    return { ingresos, egresos, balance: ingresos - egresos };
}

// Helper para auditoría en consola del navegador
window.sggDebugSQL = function(query) {
    if (!db) return;
    const res = db.exec(query);
    if (res.length === 0) {
        console.log("Sin filas devueltas.");
        return [];
    }
    const cols = res[0].columns;
    const rows = res[0].values.map(valRow => {
        const obj = {};
        cols.forEach((c, i) => obj[c] = valRow[i]);
        return obj;
    });
    console.table(rows);
    return rows;
};
