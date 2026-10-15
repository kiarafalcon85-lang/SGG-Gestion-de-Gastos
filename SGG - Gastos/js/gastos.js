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

            // DESGLOSE ESPECÍFICO DE ERRORES DE FECHA
            const partesFecha = fechaStr.split("-");
            const anioGasto = parseInt(partesFecha[0], 10);

            // Error 1: Año incorrecto o fuera de rango (ej. 0003, 0012)
            if (isNaN(anioGasto) || anioGasto < 1900) {
                mostrarMensaje("⚠️ El año ingresado no es válido. Debe ser a partir del año 1900.");
                return;
            }

            // Error 2: Fecha o día colocado en el futuro
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
