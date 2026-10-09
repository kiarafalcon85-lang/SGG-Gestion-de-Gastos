document.addEventListener("DOMContentLoaded", () => {
    // ESTABLECER FECHA MÁXIMA PERMITIDA AL DÍA DE HOY (PRESENTES Y PASADOS)
    const fechaInput = document.getElementById("gasto-fecha");
    const hoyStr = new Date().toISOString().split("T")[0];
    if (fechaInput) {
        fechaInput.setAttribute("max", hoyStr);
    }

    // 1. MODO OSCURO / DÍA
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

    // 2. VISUALIZAR / OCULTAR CONTRASEÑA
    document.querySelectorAll(".btn-toggle-pass").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const input = document.getElementById(targetId);
            if (input) {
                if (input.type === "password") {
                    input.type = "text";
                    btn.textContent = "🙈";
                } else {
                    input.type = "password";
                    btn.textContent = "👁️";
                }
            }
        });
    });

    // 3. REFERENCIAS DE AUTENTICACIÓN
    const authView = document.getElementById("auth-view");
    const panelView = document.getElementById("panel-view");
    const formLogin = document.getElementById("form-login");
    const formRegister = document.getElementById("form-register");
    const formRecover = document.getElementById("form-recover");

    const goToRegister = document.getElementById("go-to-register");
    const goToLoginFromReg = document.getElementById("go-to-login-from-reg");
    const goToRecover = document.getElementById("go-to-recover");
    const goToLoginFromRec = document.getElementById("go-to-login-from-rec");
    const btnLogout = document.getElementById("btn-logout");
    const userDisplay = document.getElementById("user-display");

    // Base de Usuarios Registrados
    let usuariosBD = JSON.parse(localStorage.getItem("usuarios_sgg")) || [
        { email: "admin@profesor.com", pass: "123456", nombre: "Profesor", pregunta: "Rosa" }
    ];

    function mostrarVistaAuth(vista) {
        formLogin.classList.add("hidden");
        formRegister.classList.add("hidden");
        formRecover.classList.add("hidden");
        if (vista === "login") formLogin.classList.remove("hidden");
        if (vista === "register") formRegister.classList.remove("hidden");
        if (vista === "recover") formRecover.classList.remove("hidden");
    }

    if (goToRegister) goToRegister.addEventListener("click", (e) => { e.preventDefault(); mostrarVistaAuth("register"); });
    if (goToLoginFromReg) goToLoginFromReg.addEventListener("click", (e) => { e.preventDefault(); mostrarVistaAuth("login"); });
    if (goToRecover) goToRecover.addEventListener("click", (e) => { e.preventDefault(); mostrarVistaAuth("recover"); });
    if (goToLoginFromRec) goToLoginFromRec.addEventListener("click", (e) => { e.preventDefault(); mostrarVistaAuth("login"); });

    // REGISTRO
    if (formRegister) {
        formRegister.addEventListener("submit", (e) => {
            e.preventDefault();
            const nombre = document.getElementById("reg-nombre").value.trim();
            const email = document.getElementById("reg-email").value.trim().toLowerCase();
            const pass = document.getElementById("reg-password").value.trim();
            const pregunta = document.getElementById("reg-pregunta").value.trim();

            if (pass.length < 6 || !/\d/.test(pass)) {
                alert("La contraseña debe tener al menos 6 caracteres e incluir un número.");
                return;
            }

            if (usuariosBD.some(u => u.email === email)) {
                alert("El correo electrónico ya está registrado.");
                return;
            }

            usuariosBD.push({ email, pass, nombre, pregunta });
            localStorage.setItem("usuarios_sgg", JSON.stringify(usuariosBD));

            alert("¡Cuenta registrada con éxito! 🍓 Inicia sesión con tus credenciales.");
            formRegister.reset();
            mostrarVistaAuth("login");
        });
    }

    // LOGIN
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim().toLowerCase();
            const pass = document.getElementById("login-password").value.trim();

            const userValido = usuariosBD.find(u => u.email === email && u.pass === pass);

            if (userValido) {
                localStorage.setItem("usuario_activo_sgg", JSON.stringify(userValido));
                formLogin.reset();
                verificarSesion();
            } else {
                alert("Credenciales incorrectas. Verifica correo y contraseña.");
            }
        });
    }

    // CAMBIO/RECUPERACIÓN DE CONTRASEÑA CON VALIDACIÓN
    if (formRecover) {
        formRecover.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("rec-email").value.trim().toLowerCase();
            const pregunta = document.getElementById("rec-pregunta").value.trim();
            const newPass = document.getElementById("rec-new-password").value.trim();

            const idx = usuariosBD.findIndex(u => u.email === email && u.pregunta.toLowerCase() === pregunta.toLowerCase());

            if (idx !== -1) {
                // Validación: No debe ser igual a la contraseña actual
                if (usuariosBD[idx].pass === newPass) {
                    alert("Error: La nueva contraseña no debe ser igual a la contraseña anterior.");
                    return;
                }

                if (newPass.length < 6 || !/\d/.test(newPass)) {
                    alert("La nueva contraseña debe tener al menos 6 caracteres y un número.");
                    return;
                }

                usuariosBD[idx].pass = newPass;
                localStorage.setItem("usuarios_sgg", JSON.stringify(usuariosBD));
                alert("¡Contraseña actualizada con éxito! 🍓 Inicia sesión con tu nueva contraseña.");
                formRecover.reset();
                mostrarVistaAuth("login");
            } else {
                alert("Los datos de correo o respuesta de seguridad son incorrectos.");
            }
        });
    }

    // CIERRE DE SESIÓN
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("usuario_activo_sgg");
            verificarSesion();
        });
    }

    function verificarSesion() {
        const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));

        if (usuarioActivo && usuarioActivo.email) {
            authView.classList.add("hidden");
            panelView.classList.remove("hidden");
            btnLogout.classList.remove("hidden");
            if (userDisplay) userDisplay.textContent = usuarioActivo.nombre || usuarioActivo.email;
            renderizarDashboard();
        } else {
            authView.classList.remove("hidden");
            panelView.classList.add("hidden");
            btnLogout.classList.add("hidden");
            mostrarVistaAuth("login");
        }
    }

    // 4. CRUD Y VALIDACIÓN DE GASTOS
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
                    <button type="button" class="btn-edit" onclick="prepararEdicion(${item.id})">Editar ✏️</button>
                    <button type="button" class="btn-delete" onclick="eliminarGasto(${item.id})">Eliminar 🍓</button>
                </td>
            `;
            listaGastos.appendChild(tr);
        });

        if (totalMontoDisplay) {
            totalMontoDisplay.textContent = `$${totalAcumulado.toFixed(2)}`;
        }

        localStorage.setItem("gastos_sgg", JSON.stringify(gastosSGG));
    }

    if (formGastos) {
        formGastos.addEventListener("submit", (e) => {
            e.preventDefault();

            const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));
            if (!usuarioActivo) return;

            const idGasto = document.getElementById("gasto-id").value;
            const monto = parseFloat(document.getElementById("gasto-monto").value);
            const fechaStr = document.getElementById("gasto-fecha").value;
            const categoria = document.getElementById("gasto-categoria").value;
            const descripcion = document.getElementById("gasto-descripcion").value.trim();

            if (monto <= 0 || isNaN(monto)) {
                alert("Error: El monto debe ser un valor positivo mayor a 0.");
                return;
            }

            // VALIDACIÓN ESTRICTA DE FECHA FUTURA
            const fechaIngresada = new Date(fechaStr + "T00:00:00");
            const hoy = new Date();
            hoy.setHours(23, 59, 59, 999);

            if (fechaIngresada > hoy) {
                alert("Error: No puedes ingresar un gasto con una fecha futura.");
                return;
            }

            if (idGasto) {
                const idx = gastosSGG.findIndex(g => g.id == idGasto);
                if (idx !== -1) {
                    gastosSGG[idx].monto = monto;
                    gastosSGG[idx].fecha = fechaStr;
                    gastosSGG[idx].categoria = categoria;
                    gastosSGG[idx].descripcion = descripcion;
                }
            } else {
                const nuevoGasto = {
                    id: Date.now(),
                    email_usuario: usuarioActivo.email,
                    monto: monto,
                    fecha: fechaStr,
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

    if (btnCancelar) btnCancelar.addEventListener("click", resetearFormulario);

    window.eliminarGasto = function(id) {
        if (confirm("¿Estás segura de eliminar este gasto?")) {
            gastosSGG = gastosSGG.map(g => g.id === id ? { ...g, estado_activo: false } : g);
            renderizarDashboard();
        }
    };

    verificarSesion();
});
