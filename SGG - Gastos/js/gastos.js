document.addEventListener("DOMContentLoaded", () => {
    // 1. MODO OSCURO
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

    // 2. VISTAS Y AUTENTICACIÓN
    const authView = document.getElementById("auth-view");
    const crudView = document.getElementById("crud-view");
    const formLogin = document.getElementById("form-login");
    const formRegister = document.getElementById("form-register");
    const goToRegister = document.getElementById("go-to-register");
    const goToLogin = document.getElementById("go-to-login");
    const btnLogout = document.getElementById("btn-logout");

    // Alternar Login y Registro
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

    // Login
    if (formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const pass = document.getElementById("login-password").value;

            if (email === "admin@profesor.com" && pass === "123456") {
                sessionStorage.setItem("sgg_logged", "true");
                cargarVistaPanel();
            } else {
                alert("Credenciales incorrectas. Usar: admin@profesor.com / 123456");
            }
        });
    }

    // Registro Simulado
    if (formRegister) {
        formRegister.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("¡Cuenta creada con éxito! 🍓 Ahora puedes iniciar sesión.");
            formRegister.classList.add("hidden");
            formLogin.classList.remove("hidden");
        });
    }

    // Cerrar Sesión
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            sessionStorage.removeItem("sgg_logged");
            authView.classList.remove("hidden");
            crudView.classList.add("hidden");
            btnLogout.classList.add("hidden");
        });
    }

    function cargarVistaPanel() {
        if (sessionStorage.getItem("sgg_logged") === "true") {
            authView.classList.add("hidden");
            crudView.classList.remove("hidden");
            btnLogout.classList.remove("hidden");
            renderGastos();
        }
    }

    // Verificación inicial al cargar
    cargarVistaPanel();

    // 3. TABLA Y CRUD DE GASTOS
    const formGastos = document.getElementById("form-gastos");
    const listaGastos = document.getElementById("lista-gastos");
    let gastos = JSON.parse(localStorage.getItem("sgg_gastos")) || [
        { id: 1, concepto: "Papelería & Stickers 🌸", monto: 4500, activo: true },
        { id: 2, concepto: "Café con amigas 🍓", monto: 12000, activo: true }
    ];

    function renderGastos() {
        if (!listaGastos) return;
        listaGastos.innerHTML = "";
        
        gastos.forEach((item) => {
            if (item.activo) {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${item.concepto}</td>
                    <td>$${parseFloat(item.monto).toFixed(2)}</td>
                    <td><span style="color: #ff758f; font-weight: bold;">Activo</span></td>
                    <td>
                        <button onclick="eliminarGasto(${item.id})" class="btn-logout" style="padding: 4px 10px; font-size: 11px;">Eliminar 🍓</button>
                    </td>
                `;
                listaGastos.appendChild(tr);
            }
        });

        localStorage.setItem("sgg_gastos", JSON.stringify(gastos));
    }

    if (formGastos) {
        formGastos.addEventListener("submit", (e) => {
            e.preventDefault();
            const concepto = document.getElementById("gasto-concepto").value;
            const monto = document.getElementById("gasto-monto").value;

            if (monto <= 0) {
                alert("El monto debe ser un número positivo.");
                return;
            }

            gastos.push({
                id: Date.now(),
                concepto: concepto,
                monto: parseFloat(monto),
                activo: true
            });

            renderGastos();
            formGastos.reset();
        });
    }

    window.eliminarGasto = function(id) {
        gastos = gastos.map(g => g.id === id ? { ...g, activo: false } : g);
        renderGastos();
    };
});
