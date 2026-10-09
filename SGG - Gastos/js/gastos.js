document.addEventListener("DOMContentLoaded", () => {
    // FECHA MÁXIMA PERMITIDA (HASTA HOY)
    const fechaInput = document.getElementById("gasto-fecha");
    const regNacimiento = document.getElementById("reg-nacimiento");
    
    const hoyObj = new Date();
    const anio = hoyObj.getFullYear();
    const mes = String(hoyObj.getMonth() + 1).padStart(2, '0');
    const dia = String(hoyObj.getDate()).padStart(2, '0');
    const hoyStr = `${anio}-${mes}-${dia}`;

    if (fechaInput) fechaInput.setAttribute("max", hoyStr);
    if (regNacimiento) regNacimiento.setAttribute("max", hoyStr);

    // CUADRO DE MENSAJES AESTHETIC
    const msgBox = document.getElementById("msg-box");

    function mostrarMensaje(texto, tipo = "error") {
        if (!msgBox) return;
        msgBox.textContent = texto;
        msgBox.className = `msg-box ${tipo}`;
        msgBox.classList.remove("hidden");

        setTimeout(() => {
            msgBox.classList.add("hidden");
        }, 4000);
    }

    function ocultarMensaje() {
        if (msgBox) msgBox.classList.add("hidden");
    }

    // VALIDACIÓN DE CORREO
    function esEmailValido(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    // VALIDACIÓN DINÁMICA DE CONTRASEÑA Y CAMBIO DE CORAZONES (♡ -> ♥)
    const regPassInput = document.getElementById("reg-password");
    if (regPassInput) {
        regPassInput.addEventListener("input", () => {
            const val = regPassInput.value;

            actualizarRequisito("req-length", val.length >= 6);
            actualizarRequisito("req-number", /\d/.test(val));
            actualizarRequisito("req-upper", /[A-Z]/.test(val));
            actualizarRequisito("req-lower", /[a-z]/.test(val));
        });
    }

    function actualizarRequisito(id, esValido) {
        const item = document.getElementById(id);
        if (item) {
            const icon = item.querySelector(".heart-icon");
            if (esValido) {
                item.classList.add("valid");
                if (icon) icon.textContent = "♥";
            } else {
                item.classList.remove("valid");
                if (icon) icon.textContent = "♡";
            }
        }
    }

    // MODO OSCURO / DÍA
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

    // TOGGLE OJO VER CONTRASEÑA
    document.querySelectorAll(".btn-toggle-pass").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const input = document.getElementById(targetId);
            if (input) {
                if (input.type === "password") {
                    input.type = "text";
                    btn.innerHTML = `
                        <svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>`;
                } else {
                    input.type = "password";
                    btn.innerHTML = `
                        <svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>`;
                }
            }
        });
    });

    // USUARIOS Y NAVEGACIÓN
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

    let usuariosBD = JSON.parse(localStorage.getItem("usuarios_sgg")) || [
        { email: "admin@profesor.com", pass: "123456", nombre: "Profesor", pregunta: "Rosa" }
    ];

    function mostrarVistaAuth(vista) {
        ocultarMensaje();
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

    // REGISTRO CON VALIDACIÓN DE 4 REQUISITOS
    if (formRegister) {
        formRegister.addEventListener("submit", (e) => {
            e.preventDefault();
            const nombre = document.getElementById("reg-nombre").value.trim();
            const apellido = document.getElementById("reg-apellido").value.trim();
            const nacimiento = document.getElementById("reg-nacimiento").value;
            const email = document.getElementById("reg-email").value.trim().toLowerCase();
            const pass = document.getElementById("reg-password").value.trim();
            const confirmPass = document.getElementById("reg-confirm-password").value.trim();
            const pregunta = document.getElementById("reg-pregunta").value.trim();

            if (!nombre || !apellido || !nacimiento || !email || !pass || !confirmPass || !pregunta) {
                mostrarMensaje("⚠️ Por favor completa todos los campos del registro.");
                return;
            }

            if (!esEmailValido(email)) {
                mostrarMensaje("⚠️ Ingrese un correo electrónico válido (ej. tu.correo@gmail.com).");
                return;
            }

            if (pass.length < 6 || !/\d/.test(pass) || !/[A-Z]/.test(pass) || !/[a-z]/.test(pass)) {
                mostrarMensaje("⚠️ La contraseña debe cumplir todos los requisitos (6 caracteres, número, mayúscula y minúscula).");
                return;
            }

            if (pass !== confirmPass) {
                mostrarMensaje("⚠️ Las contraseñas no coinciden. Verifícalas.");
                return;
            }

            if (usuariosBD.some(u => u.email === email)) {
                mostrarMensaje("⚠️ El correo electrónico ya se encuentra registrado.");
                return;
            }

            usuariosBD.push({ email, pass, nombre: `${nombre} ${apellido}`, pregunta });
            localStorage.setItem("usuarios_sgg", JSON.stringify(usuariosBD));

            mostrarMensaje("¡Cuenta registrada con éxito! 🎀 Inicia sesión.", "success");
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

            if (!esEmailValido(email)) {
                mostrarMensaje("⚠️ Ingresa un correo electrónico válido.");
                return;
            }

            const userValido = usuariosBD.find(u => u.email === email && u.pass === pass);

            if (userValido) {
                localStorage.setItem("usuario_activo_sgg", JSON.stringify(userValido));
                formLogin.reset();
                ocultarMensaje();
                verificarSesion();
            } else {
                mostrarMensaje("⚠️ Credenciales incorrectas. Verifica correo y contraseña.");
            }
        });
    }

    // RECUPERAR CONTRASEÑA
    if (formRecover) {
        formRecover.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("rec-email").value.trim().toLowerCase();
            const pregunta = document.getElementById("rec-pregunta").value.trim();
            const newPass = document.getElementById("rec-new-password").value.trim();

            if (!esEmailValido(email)) {
                mostrarMensaje("⚠️ Ingrese un correo electrónico válido.");
                return;
            }

            const idx = usuariosBD.findIndex(u => u.email === email && u.pregunta.toLowerCase() === pregunta.toLowerCase());

            if (idx !== -1) {
                if (usuariosBD[idx].pass === newPass) {
                    mostrarMensaje("⚠️ La nueva contraseña no debe ser igual a la anterior.");
                    return;
                }

                if (newPass.length < 6 || !/\d/.test(newPass)) {
                    mostrarMensaje("⚠️ La nueva contraseña debe tener al menos 6 caracteres y 1 número.");
                    return;
                }

                usuariosBD[idx].pass = newPass;
                localStorage.setItem("usuarios_sgg", JSON.stringify(usuariosBD));
                mostrarMensaje("¡Contraseña actualizada con éxito! 🎀 Inicia sesión.", "success");
                formRecover.reset();
                mostrarVistaAuth("login");
            } else {
                mostrarMensaje("⚠️ Correo o respuesta de seguridad incorrectos.");
            }
        });
    }

    // LOGOUT
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("usuario_activo_sgg");
            ocultarMensaje();
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

    // CRUD GASTOS
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
                <td class="text-center">
                    <div class="action-btns">
                        <button type="button" class="btn-edit" onclick="prepararEdicion(${item.id})">Editar ✏️</button>
                        <button type="button" class="btn-delete" onclick="eliminarGasto(${item.id})">Eliminar 🎀</button>
                    </div>
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

            if (!monto || monto <= 0 || isNaN(monto)) {
                mostrarMensaje("⚠️ El monto debe ser un número positivo mayor a $0.");
                return;
            }

            if (!fechaStr) {
                mostrarMensaje("⚠️ Por favor selecciona una fecha.");
                return;
            }

            if (fechaStr > hoyStr) {
                mostrarMensaje("⚠️ No puedes registrar un gasto con fecha futura.");
                return;
            }

            if (!categoria) {
                mostrarMensaje("⚠️ Por favor selecciona una categoría.");
                return;
            }

            if (!descripcion) {
                mostrarMensaje("⚠️ Ingresa una descripción para el gasto.");
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
            ocultarMensaje();
            renderizarDashboard();
        });
    }

    function resetearFormulario() {
        if (formGastos) formGastos.reset();
        document.getElementById("gasto-id").value = "";
        formTitle.textContent = "Registrar Nuevo Gasto 🌸";
        btnGuardar.textContent = "Guardar Gasto 🎀";
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
