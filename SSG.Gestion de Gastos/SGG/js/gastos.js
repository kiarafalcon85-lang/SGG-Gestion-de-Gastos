document.addEventListener("DOMContentLoaded", () => {
    const formGasto = document.getElementById("form-gasto");
    const tablaGastos = document.getElementById("tabla-gastos-body");
    const totalIngresosEl = document.getElementById("total-ingresos");
    const totalGastosEl = document.getElementById("total-gastos");
    const totalBalanceEl = document.getElementById("total-balance");

    // Array para almacenar la lista de gastos
    let gastos = JSON.parse(localStorage.getItem("sgg_gastos")) || [];
    let ingresos = 5820; // Puedes cambiar o dinamizar este valor inicial

    // Función para renderizar los gastos en la tabla y actualizar totales
    function actualizarUI() {
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

        // Calcular balances
        const balance = ingresos - sumaGastos;

        // Actualizar valores en pantalla
        totalIngresosEl.textContent = `$${ingresos.toFixed(2)}`;
        totalGastosEl.textContent = `$${sumaGastos.toFixed(2)}`;
        totalBalanceEl.textContent = `$${balance.toFixed(2)}`;

        // Guardar en el almacenamiento local del navegador
        localStorage.setItem("sgg_gastos", JSON.stringify(gastos));
    }

    // Evento para agregar un gasto
    if (formGasto) {
        formGasto.addEventListener("submit", (e) => {
            e.preventDefault();

            const descripcion = document.getElementById("gasto-descripcion").value;
            const monto = parseFloat(document.getElementById("gasto-monto").value);
            const categoria = document.getElementById("gasto-categoria").value;
            const fecha = document.getElementById("gasto-fecha").value;

            const nuevoGasto = { descripcion, monto, categoria, fecha };
            gastos.push(nuevoGasto);

            actualizarUI();
            formGasto.reset();
        });
    }

    // Evento para eliminar un gasto de la lista
    if (tablaGastos) {
        tablaGastos.addEventListener("click", (e) => {
            if (e.target.classList.contains("btn-delete")) {
                const index = e.target.getAttribute("data-index");
                gastos.splice(index, 1);
                actualizarUI();
            }
        });
    }

    // Cargar datos al iniciar
    actualizarUI();
});
