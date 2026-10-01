document.addEventListener("DOMContentLoaded", () => {
    // 1. REGLA A: SEGURIDAD DE RUTAS (CP-05.1)
    const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));
    
    // Si no existe la sesión activa, redirige forzosamente a index.html
    if (!usuarioActivo || !usuarioActivo.email) {
        window.location.href = "index.html";
        return;
    }

    // 2. MODO OSCURO / DÍA
    const themeBtn = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("sgg_theme") || "light";

    if (savedTheme === "dark") {
        document.body.classList.replace("light-mode", "dark-mode");
        if (themeBtn) themeBtn.textContent = "☀️ Modo Claro";
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            if (document.body.classList.contains("light-mode")) {
                document.body.classList.replace("light-mode", "dark-mode");
                localStorage.setItem("sgg_theme", "dark");
                themeBtn.textContent = "☀️ Modo Claro";
            } else {
                document.body.classList.replace("dark-mode", "light-mode");
                localStorage.setItem("sgg_theme", "light");
                themeBtn.textContent = "🌙 Modo Oscuro";
            }
        });
    }

    // 3. CERRAR SESIÓN
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("usuario_activo_sgg");
            window.location.href = "index.html";
        });
    }

    // 4. CRUD Y REGLAS DE NEGOCIO (RF-05 a RF-09)
    const formGastos = document.getElementById("form-gastos");
    const listaGastos = document.getElementById("lista-gastos");
    const totalMontoDisplay = document.getElementById("total-monto");
    const formTitle = document.getElementById("form-title");
    const btnGuardar = document.getElementById("btn-guardar");
    const btnCancelar = document.getElementById("btn-cancelar");

    // Carga de array global desde LocalStorage
    let gastosSGG = JSON.parse(localStorage.getItem("gastos_sgg")) || [];

    // RF-06: RENDERIZADO DINÁMICO & RF-09: PANEL DE RESUMEN
    function renderizarDashboard() {
        listaGastos.innerHTML = "";
        let totalAcumulado = 0;

        // Filtra únicamente los registros del usuario actual con estado_activo === true
        const misGastosActivos = gastosSGG.filter(gasto => 
            gasto.email_usuario === usuarioActivo.email && gasto.estado_activo === true
        );

        misGastosActivos.forEach((item) => {
            totalAcumulado += parseFloat(item.monto);

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.fecha}</td>
                <td>${item.categoria}</td>
                <td>${item.descripcion}</td>
                <td>$${parseFloat(item.monto).toFixed(2)}</td>
                <td>
                    <button class="btn-edit" onclick="prepararEdicion(${item.id})">Editar ✏️</button>
                    <button class="btn-delete" onclick="eliminarGasto(${item.id})">Eliminar 🍓</button>
                </td>
            `;
            listaGastos.appendChild(tr);
        });

        // Formatea y actualiza la tarjeta principal del total (RF-09)
        totalMontoDisplay.textContent = `$${totalAcumulado.toFixed(2)}`;

        // Sincroniza en LocalStorage
        localStorage.setItem("gastos_sgg", JSON.stringify(gastosSGG));
    }

    // RF-05 / RF-07: CREAR Y EDITAR
    formGastos.addEventListener("submit", (e) => {
        e.preventDefault();

        const idGasto = document.getElementById("gasto-id").value;
        const monto = parseFloat(document.getElementById("gasto-monto").value);
        const fecha = document.getElementById("gasto-fecha").value;
        const categoria = document.getElementById("gasto-categoria").value;
        const descripcion = document.getElementById("gasto-descripcion").value;

        // CP-05.2: Validación de monto positivo
        if (monto <= 0 || isNaN(monto)) {
            alert("El monto debe ser un valor positivo mayor a 0.");
            return;
        }

        if (idGasto) {
            // RF-07: EDICIÓN
            const index = gastosSGG.findIndex(g => g.id == idGasto);
            if (index !== -1) {
                gastosSGG[index].monto = monto;
                gastosSGG[index].fecha = fecha;
                gastosSGG[index].categoria = categoria;
                gastosSGG[index].descripcion = descripcion;
            }
        } else {
            // RF-05: CREACIÓN
            const nuevoGasto = {
                id: Date.now(),
                email_usuario: usuarioActivo.email,
                monto: monto,
                fecha: fecha,
                categoria: categoria,
                descripcion: descripcion,
                estado_activo: true
            };
            gastosSGG.push(nuevoGasto);
        }

        resetearFormulario();
        renderizarDashboard();
    };

    // Prepara los campos del formulario para editar (RF-07)
    window.prepararEdicion = function(id) {
        const gasto = gastosSGG.find(g => g.id === id);
        if (gasto) {
            document.getElementById("gasto-id").value = gasto.id;
            document.getElementById("gasto-monto").value = gasto.monto;
            document.getElementById("gasto-fecha").value = gasto.fecha;
            document.getElementById("gasto-categoria").value = gasto.categoria;
            document.getElementById("gasto-descripcion").value = gasto.descripcion;

            formTitle.textContent = "Editar Gasto ✏️";
            btnGuardar.textContent = "Actualizar Gasto";
            btnCancelar.classList.remove("hidden");
        }
    };

    btnCancelar.addEventListener("click", resetearFormulario);

    function resetearFormulario() {
        formGastos.reset();
        document.getElementById("gasto-id").value = "";
        formTitle.textContent = "Registrar Nuevo Gasto 🌸";
        btnGuardar.textContent = "Guardar Gasto 🍓";
        btnCancelar.classList.add("hidden");
    }

    // RF-08 / CP-08.1: ELIMINACIÓN SEGURA (BAJA LÓGICA)
    window.eliminarGasto = function(id) {
        const confirmacion = confirm("¿Estás segura de que deseas eliminar este registro?");
        if (confirmacion) {
            // Cambia el estado_activo a false sin usar .splice()
            gastosSGG = gastosSGG.map(gasto => {
                if (gasto.id === id) {
                    return { ...gasto, estado_activo: false };
                }
                return gasto;
            });
            renderizarDashboard();
        }
    };

    // Renderizado inicial
    renderizarDashboard();
});
