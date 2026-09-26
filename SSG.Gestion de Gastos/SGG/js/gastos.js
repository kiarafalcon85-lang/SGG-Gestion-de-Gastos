document.addEventListener("DOMContentLoaded", () => {
    const formGasto = document.getElementById("form-gasto");
    const tablaGastos = document.getElementById("tabla-gastos-body");
    const totalIngresosEl = document.getElementById("total-ingresos");
    const totalGastosEl = document.getElementById("total-gastos");
    const totalBalanceEl = document.getElementById("total-balance");

    let gastos = JSON.parse(localStorage.getItem("sgg_gastos")) || [];
    let ingresos = 5820;

    function actualizarUI() {
        if (!tablaGastos) return;
        tablaGastos.innerHTML = "";
        let sumaGastos = 0;

        gastos.forEach((gasto, index) => {
            sumaGastos += parseFloat(gasto.monto);

            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${gasto.descripcion}</td>
                <td><span style="background: #fbb1bd; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px;">${gasto.categoria}</span></td>
                <td>$${parseFloat(gasto.monto).toFixed(2)}</td>
                <td><button class="btn-delete" data-index="${index}">Eliminar ✖</button></td>
            `;
            tablaGastos.appendChild(fila);
        });

        const balance = ingresos - sumaGastos;

        if (totalIngresosEl) totalIngresosEl.textContent = `$${ingresos.toFixed(2)}`;
        if (totalGastosEl) totalGastosEl.textContent = `$${sumaGastos.toFixed(2)}`;
        if (totalBalanceEl) totalBalanceEl.textContent = `$${balance.toFixed(2)}`;

        localStorage.setItem("sgg_gastos", JSON.stringify(gastos));
    }

    if (formGasto) {
        formGasto.addEventListener("submit", (e) => {
            e.preventDefault();

            const descripcion = document.getElementById("gasto-descripcion").value;
            const monto = parseFloat(document.getElementById("gasto-monto").value);
            const categoria = document.getElementById("gasto-categoria").value;
            const fecha = document.getElementById("gasto-fecha").value;

            gastos.push({ descripcion, monto, categoria, fecha });
            actualizarUI();
            formGasto.reset();
        });
    }

    if (tablaGastos) {
        tablaGastos.addEventListener("click", (e) => {
            if (e.target.classList.contains("btn-delete")) {
                const index = e.target.getAttribute("data-index");
                gastos.splice(index, 1);
                actualizarUI();
            }
        });
    }

    actualizarUI();
});
