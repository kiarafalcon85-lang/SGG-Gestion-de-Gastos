document.addEventListener("DOMContentLoaded", async () => {
    const fechaInput = document.getElementById("gasto-fecha");
    const regNacimiento = document.getElementById("reg-nacimiento");

    const hoyObj = new Date();
    const anio = hoyObj.getFullYear();
    const mes = String(hoyObj.getMonth() + 1).padStart(2, "0");
    const dia = String(hoyObj.getDate()).padStart(2, "0");
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

    // INICIALIZAR SQLITE WEBASSEMBLY + OPFS
    try {
        await inicializarBaseDeDatos();
    } catch (error) {
        console.error("Error al iniciar SQLite/OPFS:", error);
        mostrarMensaje("⚠️ Abre el proyecto con Live Server para habilitar SQLite y OPFS.");
        return;
    }

    // PALETA PASTEL (Mantiene tu comportamiento exacto)
    const colorBtns = document.querySelectorAll(".color-btn");
    const temaGuardado = localStorage.getItem("sgg_color_theme");
    if (temaGuardado && temaGuardado !== "pink") {
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
            renderizarGrafico();
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
            renderizarGrafico();
        });
    }

    // VER / OCULTAR CONTRASEÑA
    document.querySelectorAll(".btn-toggle-pass").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const input = document.getElementById(targetId);
            if (!input) return;
            if (input.type === "password") {
                input.type = "text";
                btn.innerHTML = `<svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            } else {
                input.type = "password";
                btn.innerHTML = `<svg class="eye-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            }
        });
    });

    // VALIDACIÓN DINÁMICA DE CONTRASEÑA CON CORAZONES
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
        if (!item) return;
        const icon = item.querySelector(".heart-icon");
        if (esValido) {
            item.classList.add("valid");
            if (icon) icon.textContent = "♥";
        } else {
            item.classList.remove("valid");
            if (icon) icon.textContent = "♡";
        }
    }

    // AVATAR Y APODO EN SQLITE
    const inputAvatar = document.getElementById("input-avatar");
    if (inputAvatar) {
        inputAvatar.addEventListener("change", async (e) => {
            const usuarioActivo = obtenerUsuarioActivoSQL();
            if (!usuarioActivo) return;
            const file = e.target.files[0];
            if (!file) return;

            const avatarImg = document.getElementById("profile-avatar-img");
            if (avatarImg) avatarImg.src = URL.createObjectURL(file);

            try {
                const urlAvatar = await subirComprobanteAPI(file);
                const bin = await actualizarPerfilSQL(usuarioActivo.email, "avatar_url", urlAvatar);
                if (avatarImg) avatarImg.src = urlAvatar;
                await respaldarSQLiteEnNube(usuarioActivo.email, bin);
            } catch (err) {
                console.warn("Avatar mostrado en sesión actual (API externa no disponible).");
            }
        });
    }

    const btnEditNickname = document.getElementById("btn-edit-nickname");
    const nicknameDisplay = document.getElementById("user-nickname-display");
    const modalNickname = document.getElementById("modal-nickname");
    const inputNewNickname = document.getElementById("input-new-nickname");
    const btnSaveNickname = document.getElementById("btn-save-nickname");
    const btnCancelNickname = document.getElementById("btn-cancel-nickname");

    if (btnEditNickname) {
        btnEditNickname.addEventListener("click", () => {
            const usuarioActivo = obtenerUsuarioActivoSQL();
            if (!usuarioActivo) return;
            if (inputNewNickname) inputNewNickname.value = usuarioActivo.nickname || usuarioActivo.nombre || "";
            if (modalNickname) modalNickname.classList.remove("hidden");
        });
    }

    if (btnCancelNickname) {
        btnCancelNickname.addEventListener("click", () => {
            if (modalNickname) modalNickname.classList.add("hidden");
        });
    }

    if (btnSaveNickname) {
        btnSaveNickname.addEventListener("click", async () => {
            const usuarioActivo = obtenerUsuarioActivoSQL();
            if (!usuarioActivo) return;
            const nuevoNick = inputNewNickname.value.trim();
            if (!nuevoNick) {
                mostrarMensaje("⚠️ Por favor ingresa un apodo válido.");
                return;
            }
            const bin = await actualizarPerfilSQL(usuarioActivo.email, "nickname", nuevoNick);
            if (nicknameDisplay) nicknameDisplay.textContent = `${nuevoNick} ♡`;
            if (modalNickname) modalNickname.classList.add("hidden");
            await respaldarSQLiteEnNube(usuarioActivo.email, bin);
        });
    }

    // NAVEGACIÓN AUTH
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
        formRegister.addEventListener("submit", async (e) => {
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
            if (existeEmailSQL(email)) {
                mostrarMensaje("⚠️ El correo ya se encuentra registrado.");
                return;
            }

            const bin = await registrarUsuarioSQL({ email, pass, nombre, apellido, nacimiento, pregunta });
            await respaldarSQLiteEnNube(email, bin);

            mostrarMensaje("¡Cuenta registrada con éxito! 🎀 Inicia sesión.", "success");
            formRegister.reset();
            mostrarVistaAuth("login");
        });
    }

    // LOGIN (Con descarga Offline-First desde BaaS si es un navegador nuevo)
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim().toLowerCase();
            const pass = document.getElementById("login-password").value.trim();

            if (!esEmailValido(email)) {
                mostrarMensaje("⚠️ Ingresa un correo electrónico válido.");
                return;
            }

            if (!existeEmailSQL(email)) {
                await restaurarSQLiteDesdeNube(email);
            }

            const userValido = buscarUsuarioPorCredencialesSQL(email, pass);

            if (userValido) {
                await guardarSesionSQL(userValido.email);
                formLogin.reset();
                ocultarMensaje();
                verificarSesion();
            } else {
                mostrarMensaje("⚠️ Credenciales incorrectas.");
            }
        });
    }

    // RECUPERAR CONTRASEÑA
    if (formRecover) {
        formRecover.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("rec-email").value.trim().toLowerCase();
            const pregunta = document.getElementById("rec-pregunta").value.trim();
            const newPass = document.getElementById("rec-new-password").value.trim();

            if (!esEmailValido(email)) {
                mostrarMensaje("⚠️ Ingrese un correo electrónico válido.");
                return;
            }
            if (newPass.length < 6 || !/\d/.test(newPass)) {
                mostrarMensaje("⚠️ La nueva contraseña debe tener al menos 6 caracteres y 1 número.");
                return;
            }

            const res = await actualizarPasswordSQL(email, pregunta, newPass);
            if (res.ok) {
                const bin = await persistirCambiosLocales();
                await respaldarSQLiteEnNube(email, bin);
                mostrarMensaje("¡Contraseña actualizada con éxito! 🎀 Inicia sesión.", "success");
                formRecover.reset();
                mostrarVistaAuth("login");
            } else {
                mostrarMensaje(`⚠️ ${res.error}`);
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            await guardarSesionSQL(null);
            ocultarMensaje();
            verificarSesion();
        });
    }

    function verificarSesion() {
        const usuarioActivo = obtenerUsuarioActivoSQL();

        if (usuarioActivo && usuarioActivo.email) {
            authView.classList.add("hidden");
            panelView.classList.remove("hidden");
            btnLogout.classList.remove("hidden");

            const firstNameDisplay = document.getElementById("user-firstname-display");
            const lastNameDisplay = document.getElementById("user-lastname-display");
            const avatarImg = document.getElementById("profile-avatar-img");

            if (firstNameDisplay) firstNameDisplay.textContent = usuarioActivo.nombre || "Usuario";
            if (lastNameDisplay) lastNameDisplay.textContent = usuarioActivo.apellido || "Falcón";
            if (nicknameDisplay) nicknameDisplay.textContent = `${usuarioActivo.nickname || usuarioActivo.nombre} ♡`;
            if (avatarImg) avatarImg.src = usuarioActivo.avatar_url || defaultAvatarSvg;

            renderizarDashboard();
        } else {
            authView.classList.remove("hidden");
            panelView.classList.add("hidden");
            btnLogout.classList.add("hidden");
            mostrarVistaAuth("login");
        }
    }

    // COMPROBANTE (SÍ / NO) Y SUBIDA A API EXTERNA (SIN BASE64 EN SQLITE)
    let archivoComprobanteSeleccionado = null;
    let urlComprobanteEdicion = null;

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
                archivoComprobanteSeleccionado = file;
                if (comprobantePreviewImg) comprobantePreviewImg.src = URL.createObjectURL(file);
                if (comprobantePreviewBox) comprobantePreviewBox.classList.remove("hidden");
            }
        });
    }

    function limpiarComprobantePreview() {
        archivoComprobanteSeleccionado = null;
        urlComprobanteEdicion = null;
        if (inputComprobanteFoto) inputComprobanteFoto.value = "";
        if (comprobantePreviewImg) comprobantePreviewImg.src = "";
        if (comprobantePreviewBox) comprobantePreviewBox.classList.add("hidden");
    }

    if (btnQuitarFoto) {
        btnQuitarFoto.addEventListener("click", limpiarComprobantePreview);
    }

    const modalComprobante = document.getElementById("modal-comprobante");
    const imgModalComprobante = document.getElementById("img-modal-comprobante");
    const btnCloseComprobante = document.getElementById("btn-close-comprobante");

    window.verComprobante = function(id) {
        const mov = obtenerMovimientoPorIdSQL(id);
        if (mov && mov.url_comprobante) {
            if (imgModalComprobante) imgModalComprobante.src = mov.url_comprobante;
            if (modalComprobante) modalComprobante.classList.remove("hidden");
        }
    };

    if (btnCloseComprobante) {
        btnCloseComprobante.addEventListener("click", () => {
            if (modalComprobante) modalComprobante.classList.add("hidden");
        });
    }

    // GRÁFICOS INTERACTIVOS CON CHART.JS (CONSULTAS SQL GROUP BY / SUM)
    let chartDonaCategorias = null;
    let chartBarrasComparativa = null;

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
        return isDark
            ? ["#f48fb1", "#f06292", "#ec407a", "#e91e63", "#d81b60", "#f8bbd0", "#fce4ec", "#ad1457"]
            : ["#c2185b", "#d81b60", "#e91e63", "#ec407a", "#f06292", "#f48fb1", "#880e4f", "#ad1457"];
    }

    function renderizarGrafico() {
        const usuarioActivo = obtenerUsuarioActivoSQL();
        if (!usuarioActivo || typeof Chart === "undefined") return;

        const computedStyles = getComputedStyle(document.body);
        const textColor = computedStyles.getPropertyValue("--text-primary").trim() || "#801336";
        const colores = obtenerPaletaGrafico();

        // 1. Gráfico de Dona: Egresos por Categoría
        const canvasCat = document.getElementById("gastos-chart");
        const emptyMsg = document.getElementById("chart-empty-msg");
        const datosCategorias = obtenerEgresosPorCategoriaSQL(usuarioActivo.email);

        if (chartDonaCategorias) {
            chartDonaCategorias.destroy();
            chartDonaCategorias = null;
        }

        if (datosCategorias.length === 0) {
            if (canvasCat) canvasCat.parentElement.classList.add("hidden");
            if (emptyMsg) emptyMsg.classList.remove("hidden");
        } else {
            if (canvasCat) canvasCat.parentElement.classList.remove("hidden");
            if (emptyMsg) emptyMsg.classList.add("hidden");

            chartDonaCategorias = new Chart(canvasCat, {
                type: "doughnut",
                data: {
                    labels: datosCategorias.map(d => d.categoria),
                    datasets: [{
                        data: datosCategorias.map(d => d.total),
                        backgroundColor: colores,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: { color: textColor, font: { family: "Quicksand", weight: "bold" } }
                        }
                    }
                }
            });
        }

        // 2. Gráfico de Barras: Ingresos vs. Egresos
        const canvasComp = document.getElementById("comparativa-chart");
        const emptyCompMsg = document.getElementById("comparativa-empty-msg");
        const { ingresos, egresos } = obtenerComparativaIngresosEgresosSQL(usuarioActivo.email);

        if (chartBarrasComparativa) {
            chartBarrasComparativa.destroy();
            chartBarrasComparativa = null;
        }

        if (ingresos === 0 && egresos === 0) {
            if (canvasComp) canvasComp.parentElement.classList.add("hidden");
            if (emptyCompMsg) emptyCompMsg.classList.remove("hidden");
        } else {
            if (canvasComp) canvasComp.parentElement.classList.remove("hidden");
            if (emptyCompMsg) emptyCompMsg.classList.add("hidden");

            chartBarrasComparativa = new Chart(canvasComp, {
                type: "bar",
                data: {
                    labels: ["Ingresos", "Egresos"],
                    datasets: [{
                        label: "Total ($)",
                        data: [ingresos, egresos],
                        backgroundColor: [colores[2] || "#81c784", colores[0] || "#c2185b"],
                        borderRadius: 12
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            ticks: { color: textColor, font: { family: "Quicksand", weight: "bold" } },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: { color: textColor, font: { family: "Quicksand" } }
                        }
                    }
                }
            });
        }
    }

    // CRUD DE MOVIMIENTOS
    const formGastos = document.getElementById("form-gastos");
    const listaGastos = document.getElementById("lista-gastos");
    const totalMontoDisplay = document.getElementById("total-monto");
    const formTitle = document.getElementById("form-title");
    const btnGuardar = document.getElementById("btn-guardar");
    const btnCancelar = document.getElementById("btn-cancelar");

    function renderizarDashboard() {
        const usuarioActivo = obtenerUsuarioActivoSQL();
        if (!usuarioActivo || !listaGastos) return;

        listaGastos.innerHTML = "";
        const movimientos = obtenerMovimientosActivosSQL(usuarioActivo.email);

        movimientos.forEach((item) => {
            const esIngreso = item.tipo_movimiento === "ingreso";
            const comprobanteHtml = item.url_comprobante
                ? `<button type="button" class="btn-ver-comprobante" onclick="verComprobante(${item.id})">Ver Foto 🧾</button>`
                : `<span class="sin-comprobante-tag">No</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.fecha}</td>
                <td>${esIngreso ? "Ingreso" : "Egreso"}</td>
                <td>${item.categoria}</td>
                <td>${item.descripcion}</td>
                <td>${esIngreso ? "+" : "-"}$${parseFloat(item.monto).toFixed(2)}</td>
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

        const { balance } = obtenerComparativaIngresosEgresosSQL(usuarioActivo.email);
        if (totalMontoDisplay) {
            const signo = balance < 0 ? "-" : "";
            totalMontoDisplay.textContent = `${signo}$${Math.abs(balance).toFixed(2)}`;
        }

        renderizarGrafico();
    }

    function resetearFormulario() {
        if (!formGastos) return;
        formGastos.reset();
        document.getElementById("gasto-id").value = "";
        limpiarComprobantePreview();
        comprobanteUploadGroup.classList.add("hidden");
        if (formTitle) formTitle.textContent = "Registrar Nuevo Movimiento 🎀";
        if (btnGuardar) btnGuardar.textContent = "Guardar Movimiento 🎀";
        if (btnCancelar) btnCancelar.classList.add("hidden");
    }

    if (btnCancelar) {
        btnCancelar.addEventListener("click", resetearFormulario);
    }

    window.prepararEdicion = function(id) {
        const mov = obtenerMovimientoPorIdSQL(id);
        if (!mov) return;

        document.getElementById("gasto-id").value = mov.id;
        const radioTipo = document.querySelector(`input[name="tipo-movimiento"][value="${mov.tipo_movimiento}"]`);
        if (radioTipo) radioTipo.checked = true;

        document.getElementById("gasto-monto").value = mov.monto;
        document.getElementById("gasto-fecha").value = mov.fecha;
        document.getElementById("gasto-categoria").value = mov.categoria;
        document.getElementById("gasto-descripcion").value = mov.descripcion;

        if (mov.url_comprobante) {
            const radioSi = document.querySelector('input[name="tiene-comprobante"][value="si"]');
            if (radioSi) radioSi.checked = true;
            comprobanteUploadGroup.classList.remove("hidden");
            urlComprobanteEdicion = mov.url_comprobante;
            archivoComprobanteSeleccionado = null;
            if (comprobantePreviewImg) comprobantePreviewImg.src = mov.url_comprobante;
            if (comprobantePreviewBox) comprobantePreviewBox.classList.remove("hidden");
        } else {
            const radioNo = document.querySelector('input[name="tiene-comprobante"][value="no"]');
            if (radioNo) radioNo.checked = true;
            comprobanteUploadGroup.classList.add("hidden");
            limpiarComprobantePreview();
        }

        if (formTitle) formTitle.textContent = "Editar Movimiento ✏️";
        if (btnGuardar) btnGuardar.textContent = "Actualizar Movimiento 🎀";
        if (btnCancelar) btnCancelar.classList.remove("hidden");
        formGastos.scrollIntoView({ behavior: "smooth" });
    };

    // BORRADO LÓGICO (UPDATE activo = 0)
    window.eliminarGasto = async function(id) {
        const usuarioActivo = obtenerUsuarioActivoSQL();
        if (!usuarioActivo) return;

        const bin = await eliminarMovimientoLogicoSQL(id);
        renderizarDashboard();
        await respaldarSQLiteEnNube(usuarioActivo.email, bin);
    };

    // GUARDAR / EDITAR MOVIMIENTO + RESILIENCIA API REST
    if (formGastos) {
        formGastos.addEventListener("submit", async (e) => {
            e.preventDefault();

            const usuarioActivo = obtenerUsuarioActivoSQL();
            if (!usuarioActivo) return;

            const idGasto = document.getElementById("gasto-id").value;
            const tipoMovimientoEl = document.querySelector('input[name="tipo-movimiento"]:checked');
            const tipoMovimiento = tipoMovimientoEl ? tipoMovimientoEl.value : "egreso";
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
            const anioGasto = parseInt(fechaStr.split("-")[0], 10);
            if (isNaN(anioGasto) || anioGasto < 1900 || fechaStr > hoyStr) {
                mostrarMensaje("⚠️ Ingrese una fecha válida (entre 1900 y hoy).");
                return;
            }
            if (!categoria) {
                mostrarMensaje("⚠️ Por favor selecciona una categoría.");
                return;
            }
            if (!descripcion) {
                mostrarMensaje("⚠️ Ingresa una descripción para el movimiento.");
                return;
            }

            let urlFinalComprobante = null;
            let huboErrorApi = false;

            if (tieneComprobante === "si") {
                if (archivoComprobanteSeleccionado) {
                    try {
                        urlFinalComprobante = await subirComprobanteAPI(archivoComprobanteSeleccionado);
                    } catch (err) {
                        huboErrorApi = true;
                        urlFinalComprobante = null;
                    }
                } else if (urlComprobanteEdicion) {
                    urlFinalComprobante = urlComprobanteEdicion;
                }
            }

            let binActualizado = null;
            if (idGasto) {
                binActualizado = await actualizarMovimientoSQL({
                    id: parseInt(idGasto, 10),
                    tipo_movimiento: tipoMovimiento,
                    monto,
                    fecha: fechaStr,
                    categoria,
                    descripcion,
                    url_comprobante: urlFinalComprobante
                });
            } else {
                binActualizado = await insertarMovimientoSQL({
                    email_usuario: usuarioActivo.email,
                    tipo_movimiento: tipoMovimiento,
                    monto,
                    fecha: fechaStr,
                    categoria,
                    descripcion,
                    url_comprobante: urlFinalComprobante
                });
            }

            resetearFormulario();
            renderizarDashboard();

            if (huboErrorApi) {
                mostrarMensaje("⚠️ No se pudo subir la imagen, pero el movimiento se guardó sin comprobante (NULL).");
            } else {
                mostrarMensaje("¡Movimiento guardado con éxito! 🎀", "success");
            }

            await respaldarSQLiteEnNube(usuarioActivo.email, binActualizado);
        });
    }

    verificarSesion();
});
