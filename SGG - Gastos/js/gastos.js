document.addEventListener("DOMContentLoaded", () => {
    const fechaInput = document.getElementById("gasto-fecha");
    const regNacimiento = document.getElementById("reg-nacimiento");
    
    const hoyObj = new Date();
    const anio = hoyObj.getFullYear();
    const mes = String(hoyObj.getMonth() + 1).padStart(2, '0');
    const dia = String(hoyObj.getDate()).padStart(2, '0');
    const hoyStr = `${anio}-${mes}-${dia}`;

    if (fechaInput) {
        fechaInput.setAttribute("max", hoyStr);
        fechaInput.setAttribute("min", "1900-01-01");
    }
    if (regNacimiento) {
        regNacimiento.setAttribute("max", hoyStr);
        regNacimiento.setAttribute("min", "1900-01-01");
    }

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

    function esEmailValido(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    // AVATAR SIMPLE POR DEFECTO
    const defaultAvatarSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239e2a4b'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.8-.85-5.05-2.2.03-1.68 3.37-2.6 5.05-2.6s5.02.92 5.05 2.6C15.8 19.15 14.03 20 12 20z'/></svg>";

    function cargarAvatarUsuario() {
        const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));
        const avatarImg = document.getElementById("profile-avatar-img");
        
        if (!avatarImg || !usuarioActivo) return;

        const avatarGuardado = localStorage.getItem(`sgg_avatar_${usuarioActivo.email}`);
        if (avatarGuardado) {
            avatarImg.src = avatarGuardado;
        } else {
            avatarImg.src = defaultAvatarSvg;
        }
    }

    const inputAvatar = document.getElementById("input-avatar");
    if (inputAvatar) {
        inputAvatar.addEventListener("change", (e) => {
            const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));
            if (!usuarioActivo || !usuarioActivo.email) return;

            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    const base64Img = evt.target.result;
                    const avatarImg = document.getElementById("profile-avatar-img");
                    if (avatarImg) avatarImg.src = base64Img;
                    localStorage.setItem(`sgg_avatar_${usuarioActivo.email}`, base64Img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // VALIDACIÓN DINÁMICA DE REQUISITOS DE CONTRASEÑA CON CAMBIO DE CORAZÓN (♡ a ♥)
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

    // GESTIÓN DE APODO
    const btnEditNickname = document.getElementById("btn-edit-nickname");
    const nicknameDisplay = document.getElementById("user-nickname-display");
    const modalNickname = document.getElementById("modal-nickname");
    const inputNewNickname = document.getElementById("input-new-nickname");
    const btnSaveNickname = document.getElementById("btn-save-nickname");
    const btnCancelNickname = document.getElementById("btn-cancel-nickname");

    function cargarNicknameUsuario() {
        const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));
        if (!usuarioActivo || !nicknameDisplay) return;

        const nickGuardado = localStorage.getItem(`sgg_nickname_${usuarioActivo.email}`);
        if (nickGuardado) {
            nicknameDisplay.textContent = `${nickGuardado} ♡`;
        } else {
            nicknameDisplay.textContent = `${usuarioActivo.nombre || "Usuario"} ♡`;
        }
    }

    if (btnEditNickname) {
        btnEditNickname.addEventListener("click", () => {
            const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));
            if (!usuarioActivo) return;

            const nickActual = localStorage.getItem(`sgg_nickname_${usuarioActivo.email}`) || usuarioActivo.nombre || "";
            if (inputNewNickname) inputNewNickname.value = nickActual;
            if (modalNickname) modalNickname.classList.remove("hidden");
        });
    }

    if (btnCancelNickname) {
        btnCancelNickname.addEventListener("click", () => {
            if (modalNickname) modalNickname.classList.add("hidden");
        });
    }

    if (btnSaveNickname) {
        btnSaveNickname.addEventListener("click", () => {
            const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));
            if (!usuarioActivo) return;

            const nuevoNick = inputNewNickname.value.trim();
            if (nuevoNick !== "") {
                localStorage.setItem(`sgg_nickname_${usuarioActivo.email}`, nuevoNick);
                if (nicknameDisplay) nicknameDisplay.textContent = `${nuevoNick} ♡`;
                if (modalNickname) modalNickname.classList.add("hidden");
            } else {
                mostrarMensaje("⚠️ Por favor ingresa un apodo válido.");
            }
        });
    }

    // PALETA PASTEL
    const colorBtns = document.querySelectorAll(".color-btn");
    const temaGuardado = localStorage.getItem("sgg_color_theme");

    if (temaGuardado) {
        document.body.classList.add(`theme-${temaGuardado}`);
    }

    colorBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const selectedTheme = btn.getAttribute("data-color");
            document.body.classList.remove("theme-purple", "theme-blue", "theme-mint", "theme-bw");
            if (selectedTheme !== "pink") {
                document.body.classList.add(`theme-${selectedTheme}`);
            }
            localStorage.setItem("sgg_color_theme", selectedTheme);
            renderizarGrafico(); // Actualizar colores del gráfico al cambiar tema
        });
    });

    // MODO OSCURO / CLARO
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
            renderizarGrafico(); // Actualizar colores del gráfico al cambiar modo
        });
    }

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

    let usuariosBD = JSON.parse(localStorage.getItem("usuarios_sgg")) || [
        { email: "kiarafalcon@gmail.com", pass: "Kiarafalcon359", nombre: "Kiara", apellido: "Falcón", pregunta: "Rosa" },
        { email: "admin@profesor.com", pass: "123456", nombre: "Profesor", apellido: "Admin", pregunta: "Rosa" }
    ];

    function mostrarVistaAuth(vista) {
        ocultarMensaje();
        if (formLogin) formLogin.classList.add("hidden");
        if (formRegister) formRegister.classList.add("hidden");
        if (formRecover) formRecover.classList.add("hidden");
        if (vista === "login" && formLogin) formLogin.classList.remove("hidden");
        if (vista === "register" && formRegister) formRegister.classList.remove("hidden");
        if (vista === "recover" && formRecover) formRecover.classList.remove("hidden");
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

            const anioNac = parseInt(nacimiento.split("-")[0], 10);
            if (isNaN(anioNac) || anioNac < 1900 || nacimiento > hoyStr) {
                mostrarMensaje("⚠️ Ingrese una fecha de nacimiento válida (entre 1900 y hoy).");
                return;
            }

            if (!esEmailValido(email)) {
                mostrarMensaje("⚠️ Ingrese un correo electrónico válido.");
                return;
            }

            if (pass.length < 6 || !/\d/.test(pass) || !/[A-Z]/.test(pass) || !/[a-z]/.test(pass)) {
                mostrarMensaje("⚠️ La contraseña debe cumplir todos los requisitos.");
                return;
            }

            if (pass !== confirmPass) {
                mostrarMensaje("⚠️ Las contraseñas no coinciden.");
                return;
            }

            if (usuariosBD.some(u => u.email === email)) {
                mostrarMensaje("⚠️ El correo ya se encuentra registrado.");
                return;
            }

            usuariosBD.push({ email, pass, nombre: nombre, apellido: apellido, pregunta: pregunta });
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
                mostrarMensaje("⚠️ Credenciales incorrectas.");
            }
        });
    }

    // RECUPERAR
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
            
            let primerNombre = usuarioActivo.nombre || "Usuario";
            let apellido = usuarioActivo.apellido || "";

            if (!apellido && primerNombre.includes(" ")) {
                const partes = primerNombre.split(" ");
                primerNombre = partes[0];
                apellido = partes.slice(1).join(" ");
            }

            const firstNameDisplay = document.getElementById("user-firstname-display");
            const lastNameDisplay = document.getElementById("user-lastname-display");

            if (firstNameDisplay) firstNameDisplay.textContent = primerNombre;
            if (lastNameDisplay) lastNameDisplay.textContent = apellido || "Falcón";

            cargarNicknameUsuario();
            cargarAvatarUsuario();
            renderizarDashboard();
        } else {
            authView.classList.remove("hidden");
            panelView.classList.add("hidden");
            btnLogout.classList.add("hidden");
            mostrarVistaAuth("login");
        }
    }

    // GESTIÓN DE COMPROBANTE (SÍ / NO) Y FOTO
    let comprobanteBase64Actual = "";
    const radiosComprobante = document.querySelectorAll('input[name="tiene-comprobante"]');
    const comprobanteUploadGroup = document.getElementById("comprobante-upload-group");
    const inputComprobanteFoto = document.getElementById("gasto-comprobante-foto");
    const comprobantePreviewBox = document.getElementById("comprobante-preview-box");
    const comprobantePreviewImg = document.getElementById("comprobante-preview-img");
    const btnQuitarFoto = document.getElementById("btn-quitar-foto");

    radiosComprobante.forEach(radio => {
        radio.addEventListener("change", () => {
            if (radio.value === "si" && radio.checked) {
                comprobanteUploadGroup.classList.remove("hidden");
            } else if (radio.value === "no" && radio.checked) {
                comprobanteUploadGroup.classList.add("hidden");
                limpiarComprobantePreview();
            }
        });
    });

    if (inputComprobanteFoto) {
        inputComprobanteFoto.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    comprobanteBase64Actual = evt.target.result;
                    if (comprobantePreviewImg) comprobantePreviewImg.src = comprobanteBase64Actual;
                    if (comprobantePreviewBox) comprobantePreviewBox.classList.remove("hidden");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function limpiarComprobantePreview() {
        comprobanteBase64Actual = "";
        if (inputComprobanteFoto) inputComprobanteFoto.value = "";
        if (comprobantePreviewImg) comprobantePreviewImg.src = "";
        if (comprobantePreviewBox) comprobantePreviewBox.classList.add("hidden");
    }

    if (btnQuitarFoto) {
        btnQuitarFoto.addEventListener("click", limpiarComprobantePreview);
    }

    // MODAL PARA VER COMPROBANTE GUARDADO
    const modalComprobante = document.getElementById("modal-comprobante");
    const imgModalComprobante = document.getElementById("img-modal-comprobante");
    const btnCloseComprobante = document.getElementById("btn-close-comprobante");

    window.verComprobante = function(id) {
        const gasto = gastosSGG.find(g => g.id === id);
        if (gasto && gasto.comprobante_foto) {
            if (imgModalComprobante) imgModalComprobante.src = gasto.comprobante_foto;
            if (modalComprobante) modalComprobante.classList.remove("hidden");
        }
    };

    if (btnCloseComprobante) {
        btnCloseComprobante.addEventListener("click", () => {
            if (modalComprobante) modalComprobante.classList.add("hidden");
        });
    }

    // GRÁFICO CIRCULAR POR CATEGORÍA ADAPTADO AL TEMA DETERMINADO
    function obtenerPaletaGrafico() {
        const isDark = document.body.classList.contains("dark-mode");
        const isPurple = document.body.classList.contains("theme-purple");
        const isBlue = document.body.classList.contains("theme-blue");
        const isMint = document.body.classList.contains("theme-mint");
        const isBw = document.body.classList.contains("theme-bw");

        if (isPurple) {
            return isDark
                ? ["#ce93d8", "#ba68c8", "#ab47bc", "#9c27b0", "#7b1fa2", "#e1bee7", "#f3e5f5", "#6a1b9a"]
                : ["#7b1fa2", "#9c27b0", "#ab47bc", "#ba68c8", "#ce93d8", "#6a1b9a", "#4a148c", "#8e24aa"];
        }
        if (isBlue) {
            return isDark
                ? ["#90caf9", "#64b5f6", "#42a5f5", "#2196f3", "#1e88e5", "#bbdefb", "#e3f2fd", "#1565c0"]
                : ["#1565c0", "#1976d2", "#1e88e5", "#2196f3", "#42a5f5", "#64b5f6", "#0d47a1", "#90caf9"];
        }
        if (isMint) {
            return isDark
                ? ["#a5d6a7", "#81c784", "#66bb6a", "#4caf50", "#43a047", "#c8e6c9", "#e8f5e9", "#2e7d32"]
                : ["#2e7d32", "#388e3c", "#43a047", "#4caf50", "#66bb6a", "#81c784", "#1b5e20", "#a5d6a7"];
        }
        if (isBw) {
            return isDark
                ? ["#ffffff", "#d4d4d4", "#a3a3a3", "#737373", "#525252", "#e5e5e5", "#8a8a8a", "#404040"]
                : ["#212121", "#424242", "#616161", "#757575", "#9e9e9e", "#bdbdbd", "#333333", "#888888"];
        }
        // Rosa por defecto
        return isDark
            ? ["#f48fb1", "#f06292", "#ec407a", "#e91e63", "#d81b60", "#f8bbd0", "#fce4ec", "#ad1457"]
            : ["#c2185b", "#d81b60", "#e91e63", "#ec407a", "#f06292", "#f48fb1", "#880e4f", "#ad1457"];
    }

    function renderizarGrafico() {
        const canvas = document.getElementById("gastos-chart");
        const emptyMsg = document.getElementById("chart-empty-msg");
        const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));
        if (!canvas || !usuarioActivo) return;

        const misGastos = gastosSGG.filter(g => 
            g.email_usuario === usuarioActivo.email && g.estado_activo === true
        );

        if (misGastos.length === 0) {
            canvas.classList.add("hidden");
            if (emptyMsg) emptyMsg.classList.remove("hidden");
            return;
        }

        canvas.classList.remove("hidden");
        if (emptyMsg) emptyMsg.classList.add("hidden");

        // Agrupar montos por categoría
        const totalesPorCategoria = {};
        let granTotal = 0;

        misGastos.forEach(g => {
            const cat = g.categoria;
            const monto = parseFloat(g.monto);
            totalesPorCategoria[cat] = (totalesPorCategoria[cat] || 0) + monto;
            granTotal += monto;
        });

        const categorias = Object.keys(totalesPorCategoria).sort((a, b) => totalesPorCategoria[b] - totalesPorCategoria[a]);
        const colores = obtenerPaletaGrafico();

        // Configurar escala retina para nitidez
        const dpr = window.devicePixelRatio || 1;
        const width = 560;
        const height = 310;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 92;

        const computedStyles = getComputedStyle(document.body);
        const textColor = computedStyles.getPropertyValue("--text-primary").trim() || "#801336";
        const cardBgColor = computedStyles.getPropertyValue("--card-bg").trim() || "#ffffff";

        let startAngle = -Math.PI / 2;

        categorias.forEach((cat, idx) => {
            const valor = totalesPorCategoria[cat];
            const sliceAngle = (valor / granTotal) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;
            const colorSlice = colores[idx % colores.length];

            // Dibujar porción del pastel
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colorSlice;
            ctx.fill();

            // Borde separador limpio
            ctx.lineWidth = 2;
            ctx.strokeStyle = cardBgColor;
            ctx.stroke();

            // Línea conectora y etiqueta externa (estilo imagen de referencia)
            const midAngle = startAngle + sliceAngle / 2;
            const porcent = Math.round((valor / granTotal) * 100);

            const lineStartX = centerX + Math.cos(midAngle) * radius;
            const lineStartY = centerY + Math.sin(midAngle) * radius;
            const lineMidX = centerX + Math.cos(midAngle) * (radius + 20);
            const lineMidY = centerY + Math.sin(midAngle) * (radius + 20);
            const isRight = Math.cos(midAngle) >= 0;
            const lineEndX = lineMidX + (isRight ? 18 : -18);
            const lineEndY = lineMidY;

            ctx.beginPath();
            ctx.moveTo(lineStartX, lineStartY);
            ctx.lineTo(lineMidX, lineMidY);
            ctx.lineTo(lineEndX, lineEndY);
            ctx.strokeStyle = colorSlice;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Texto de etiqueta
            ctx.font = "bold 12px 'Quicksand', sans-serif";
            ctx.fillStyle = textColor;
            ctx.textAlign = isRight ? "left" : "right";
            ctx.textBaseline = "middle";
            const labelX = lineEndX + (isRight ? 6 : -6);
            ctx.fillText(`${cat}: ${porcent}%`, labelX, lineEndY);

            startAngle = endAngle;
        });
    }

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

            const comprobanteHtml = (item.tiene_comprobante === "si" && item.comprobante_foto)
                ? `<button type="button" class="btn-ver-comprobante" onclick="verComprobante(${item.id})">Ver Foto 🧾</button>`
                : `<span class="sin-comprobante-tag">${item.tiene_comprobante === "si" ? "Sí (Sin foto)" : "No"}</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.fecha}</td>
                <td>${item.categoria}</td>
                <td>${item.descripcion}</td>
                <td>$${parseFloat(item.monto).toFixed(2)}</td>
                <td class="text-center">${comprobanteHtml}</td>
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
        renderizarGrafico();
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
            const tieneComprobanteEl = document.querySelector('input[name="tiene-comprobante"]:checked');
            const tieneComprobante = tieneComprobanteEl ? tieneComprobanteEl.value : "no";

            if (!monto || monto <= 0 || isNaN(monto)) {
                mostrarMensaje("⚠️ El monto debe ser un número positivo mayor a $0.");
                return;
            }

            if (!fechaStr) {
                mostrarMensaje("⚠️ Por favor selecciona una fecha.");
                return;
            }

            const partesFecha = fechaStr.split("-");
            const anioGasto = parseInt(partesFecha[0], 10);

            if (isNaN(anioGasto) || anioGasto < 1900) {
                mostrarMensaje("⚠️ El año ingresado no es válido. Debe ser a partir del año 1900.");
                return;
            }

            if (fechaStr > hoyStr) {
                mostrarMensaje("⚠️ La fecha seleccionada no puede ser posterior al día de hoy.");
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

            if (tieneComprobante === "si" && !comprobanteBase64Actual) {
                mostrarMensaje("⚠️ Seleccionaste que tiene comprobante, por favor sube la foto.");
                return;
            }

            if (idGasto) {
                const idx = gastosSGG.findIndex(g => g.id == idGasto);
                if (idx !== -1) {
                    gastosSGG[idx].monto = monto;
                    gastosSGG[idx].fecha = fechaStr;
                    gastosSGG[idx].categoria = categoria;
                    gastosSGG[idx].descripcion = descripcion;
                    gastosSGG[idx].tiene_comprobante = tieneComprobante;
                    gastosSGG[idx].comprobante_foto = tieneComprobante === "si" ? comprobanteBase64Actual : "";
                }
            } else {
                const nuevoGasto = {
                    id: Date.now(),
                    email_usuario: usuarioActivo.email,
                    monto: monto,
                    fecha: fechaStr,
                    categoria: categoria,
                    descripcion: descripcion,
                    tiene_comprobante: tieneComprobante,
                    comprobante_foto: tieneComprobante === "si" ? comprobanteBase64Actual : "",
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
        formTitle.textContent = "Registrar Nuevo Gasto 🎀";
        btnGuardar.textContent = "Guardar Gasto 🎀";
        btnCancelar.classList.add("hidden");
        if (comprobanteUploadGroup) comprobanteUploadGroup.classList.add("hidden");
        limpiarComprobantePreview();
    }

    window.prepararEdicion = function(id) {
        const gasto = gastosSGG.find(g => g.id === id);
        if (gasto) {
            document.getElementById("gasto-id").value = gasto.id;
            document.getElementById("gasto-monto").value = gasto.monto;
            document.getElementById("gasto-fecha").value = gasto.fecha;
            document.getElementById("gasto-categoria").value = gasto.categoria;
            document.getElementById("gasto-descripcion").value = gasto.descripcion;

            const tieneComp = gasto.tiene_comprobante || "no";
            const radioTarget = document.querySelector(`input[name="tiene-comprobante"][value="${tieneComp}"]`);
            if (radioTarget) radioTarget.checked = true;

            if (tieneComp === "si") {
                comprobanteUploadGroup.classList.remove("hidden");
                if (gasto.comprobante_foto) {
                    comprobanteBase64Actual = gasto.comprobante_foto;
                    if (comprobantePreviewImg) comprobantePreviewImg.src = comprobanteBase64Actual;
                    if (comprobantePreviewBox) comprobantePreviewBox.classList.remove("hidden");
                } else {
                    limpiarComprobantePreview();
                }
            } else {
                comprobanteUploadGroup.classList.add("hidden");
                limpiarComprobantePreview();
            }

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
