document.addEventListener("DOMContentLoaded", () => {
    // 1. Gestión del Modo Oscuro
    const themeBtn = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("sgg_theme") || "light";

    if (savedTheme === "dark") {
        document.body.classList.replace("light-mode", "dark-mode");
        if (themeBtn) themeBtn.textContent = "☀️️ Modo Claro";
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

    // 2. Cerrar Sesión
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            sessionStorage.removeItem("usuarioAutenticado");
            window.location.href = "index.html";
        });
    }

    // Mostrar el usuario activo
    const userDisplay = document.getElementById("user-display-name");
    const activeUser = sessionStorage.getItem("usuarioAutenticado");
    if (userDisplay && activeUser) {
        userDisplay.textContent = activeUser;
    }

    // 3. Lógica CRUD de Gastos
    const formGastos = document.getElementById("form-gastos");
    const listaGastos = document.getElementById("lista-gastos");
    let gastos = JSON.parse(localStorage.getItem("sgg_gastos")) || [
        { id: 1, concepto: "Servicios de Luz/Agua", monto: 4500, activo: true },
        { id: 2, concepto: "Insumos de Oficina", monto: 12000, activo: true }
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
                    <td><span style="color: green; font-weight: bold;">Activo</span></td>
                    <td>
                        <button onclick="eliminarGasto(${item.id})" class="btn-logout" style="padding: 4px 8px; font-size: 12px;">Baja Lógica</button>
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
                alert("El monto debe ser un número positivo mayor a 0.");
                return;
            }

            const nuevoGasto = {
                id: Date.now(),
                concepto: concepto,
                monto: parseFloat(monto),
                activo: true
            };

            gastos.push(nuevoGasto);
            renderGastos();
            formGastos.reset();
        });
    }

    window.eliminarGasto = function(id) {
        gastos = gastos.map(g => g.id === id ? { ...g, activo: false } : g);
        renderGastos();
    };

    renderGastos();
});
