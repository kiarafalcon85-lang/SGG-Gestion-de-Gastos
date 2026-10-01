document.addEventListener("DOMContentLoaded", () => {
    // 1. MODO OSCURO / CLARO
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

    // 2. REFERENCIAS DOM DE VISTAS Y AUTENTICACIÓN
    const authView = document.getElementById("auth-view");
    const panelView = document.getElementById("panel-view");
    const formLogin = document.getElementById("form-login");
    const formRegister = document.getElementById("form-register");
    const goToRegister = document.getElementById("go-to-register");
    const goToLogin = document.getElementById("go-to-login");
    const btnLogout = document.getElementById("btn-logout");

    // Alternar entre Formulario de Login y Registro
    if (goToRegister) {
        goToRegister.addEventListener("click", (e) => {
            e.preventDefault();
            formLogin.classList.add("hidden");
            formRegister.classList.remove("hidden");
        });
    }

    if (goToLogin) {
        goToLogin.addEventListener("click", (e) => {
            e.preventDefault();
            formRegister.classList.add("hidden");
            formLogin.classList.remove("hidden");
        });
    }

    // INICIO DE SESIÓN
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const pass = document.getElementById("login-password").value.trim();

            if (email === "admin@profesor.com" && pass === "123456") {
                const usuario = { email: email };
                localStorage.setItem("usuario_activo_sgg", JSON.stringify(usuario));
                verificarSesion();
            } else {
                alert("Credenciales incorrectas. Prueba con admin@profesor.com / 123456");
            }
        });
    }

    // REGISTRO DE USUARIO
    if (formRegister) {
        formRegister.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("reg-email").value.trim();
            if (!email) return;

            const usuario = { email: email };
            localStorage.setItem("usuario_activo_sgg", JSON.stringify(usuario));
            alert("¡Cuenta creada e iniciada con éxito! 🍓");
            verificarSesion();
        });
    }

    // CIERRE DE SESIÓN
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("usuario_activo_sgg");
            verificarSesion();
        });
    }

    // CONTROL DE VISTAS SEGÚN SESIÓN
    function verificarSesion() {
        const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));

        if (usuarioActivo && usuarioActivo.email) {
            authView.classList.add("hidden");
            panelView.classList.remove("hidden");
            btnLogout.classList.remove("hidden");
            renderizarDashboard();
        } else {
            authView.classList.remove("hidden");
            panelView.classList.add("hidden");
            btnLogout.classList.add("hidden");
        }
    }

    // 3. LOGICA DE GASTOS (CRUD Y DASHBOARD)
    const formGastos = document.getElementById("form-gastos");
    const listaGastos = document.getElementById("lista-gastos");
    const totalMontoDisplay = document.getElementById("total-monto");
    const formTitle = document.getElementById("form-title");
    const btnGuardar = document.getElementById("btn-guardar");
    const btnCancelar = document.getElementById("btn-cancelar");

    let gastosSGG = JSON.parse(localStorage.getItem("gastos_sgg")) || [];

    function renderizarDashboard() {
        const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));
        if (!usuarioActivo || !listaGastos) return;

        listaGastos.innerHTML = "";
        let totalAcumulado = 0;

        // Filtra los gastos activos del usuario logueado
        const misGastos = gastosSGG.filter(g => 
            g.email_usuario === usuarioActivo.email && g.estado_activo === true
        );

        misGastos.forEach((item) => {
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

        if (totalMontoDisplay) {
            totalMontoDisplay.textContent = `$${totalAcumulado.toFixed(2)}`;
        }

        localStorage.setItem("gastos_sgg", JSON.stringify(gastosSGG));
    }

    // GUARDAR O ACTUALIZAR GASTO
    if (formGastos) {
        formGastos.addEventListener("submit", (e) => {
            e.preventDefault();

            const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));
            if (!usuarioActivo) return;

            const idGasto = document.getElementById("gasto-id").value;
            const monto = parseFloat(document.getElementById("gasto-monto").value);
            const fecha = document.getElementById("gasto-fecha").value;
            const categoria = document.getElementById("gasto-categoria").value;
            const descripcion = document.getElementById("gasto-descripcion").value;

            if (monto <= 0 || isNaN(monto)) {
                alert("El monto debe ser un número mayor a 0.");
                return;
            }

            if (idGasto) {
                // Modo Edición
                const idx = gastosSGG.findIndex(g => g.id == idGasto);
                if (idx !== -1) {
                    gastosSGG[idx].monto = monto;
                    gastosSGG[idx].fecha = fecha;
                    gastosSGG[idx].categoria = categoria;
                    gastosSGG[idx].descripcion = descripcion;
                }
            } else {
                // Modo Creación
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
        });
    }

    function resetearFormulario() {
        if (formGastos) formGastos.reset();
        document.getElementById("gasto-id").value = "";
        formTitle.textContent = "Registrar Nuevo Gasto 🌸";
        btnGuardar.textContent = "Guardar Gasto 🍓";
        btnCancelar.classList.add("hidden");
    }

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

    if (btnCancelar) {
        btnCancelar.addEventListener("click", resetearFormulario);
    }

    // ELIMINACIÓN SEGURA (BAJA LÓGICA)
    window.eliminarGasto = function(id) {
        if (confirm("¿Estás segura de eliminar este gasto?")) {
            gastosSGG = gastosSGG.map(g => g.id === id ? { ...g, estado_activo: false } : g);
            renderizarDashboard();
        }
    };

    // Inicialización
    verificarSesion();
});
