# Sistema de Gestión de Gastos (SGG) - Módulo 2 (CRUD)

![Lighthouse Score](https://img.shields.io/badge/Lighthouse-Accessibility%20%3E%2090-brightgreen)
![Status](https://img.shields.io/badge/Status-Completed-success)

## 📌 Enlaces del Proyecto
* **Demostración en vivo (GitHub Pages):** `https://<tu-usuario>.github.io/<nombre-repositorio>/SGG/`
* **Tablero de Control de Tareas (Trello):** [Enlace a tu Trello]
* **Matriz de Control Técnico (Google Sheets):** [Enlace a tu Google Sheets]

---

## 📄 1. Especificación de Requerimientos (IEEE 830)

### RF-05: Carga de Gasto (Create)
* **User Story:** Como usuario autenticado, quiero registrar un nuevo gasto ingresando monto, fecha, categoría y descripción, para llevar un control exacto de mis salidas de dinero.
* **Ficha Técnica:**
  * **Entradas:** Monto (`number` $> 0$), Fecha (`date`), Categoría (`select`), Descripción (`text`).
  * **Procesamiento:** Validación de importes positivos. Asignación de ID único y `usuario_id` del usuario activo. Persistencia en `gastos_sgg` dentro de `localStorage` con la bandera `estado_activo: true`.
  * **Salida:** Inserción del registro y actualización inmediata de la interfaz gráfica y totalizador.

### RF-06: Historial Dinámico (Read)
* **User Story:** Como usuario autenticado, quiero visualizar únicamente el historial de mis propios gastos, para mantener la privacidad de mi información financiera.
* **Ficha Técnica:**
  * **Entradas:** Email del usuario extraído de la sesión activa (`sesion_sgg`).
  * **Procesamiento:** Lectura de `gastos_sgg`, filtrado condicional por `usuario_id == email_sesion` y `estado_activo == true`.
  * **Salida:** Renderizado dinámico de filas en la tabla del dashboard.

### RF-07: Edición de Registro (Update)
* **User Story:** Como usuario autenticado, quiero modificar los datos de un gasto registrado previamente, para corregir errores de tipeo o ajustes en los importes.
* **Ficha Técnica:**
  * **Entradas:** ID del registro seleccionado y campos editados en el formulario.
  * **Procesamiento:** Búsqueda en el array por ID, revalidación de datos y actualización de propiedades.
  * **Salida:** Refresco de la interfaz y actualización del almacenamiento local.

### RF-08: Eliminación Segura (Delete / Baja Lógica)
* **User Story:** Como usuario autenticado, quiero inactivar un gasto previa confirmación en un modal, para no ver registros no deseados en la pantalla sin perder la trazabilidad.
* **Ficha Técnica:**
  * **Entradas:** Evento de confirmación en modal de interfaz.
  * **Procesamiento:** Cambio de la propiedad `estado_activo` a `false`. **Sin métodos destructivos como `splice`**.
  * **Salida:** Ocultamiento visual del registro y recalculo dinámico del saldo.

### RF-09: Panel de Resumen (Dashboard)
* **User Story:** Como usuario autenticado, quiero ver el cálculo automático del gasto total acumulado, para monitorear mi presupuesto global.
* **Ficha Técnica:**
  * **Entradas:** Registros filtrados activos del usuario actual.
  * **Procesamiento:** Reducción/Sumatoria aritmética de la columna `monto`.
  * **Salida:** Muestra del total acumulado formateado en la tarjeta de resumen.

---

## 🔒 2. Reglas de Negocio y UX

1. **Seguridad de Rutas (Middleware Frontend):** `dashboard.html` verifica al cargar la presencia del objeto `sesion_sgg`. Si no existe, realiza un redireccionamiento forzado a `index.html`.
2. **Trazabilidad y Relaciones:** Los gastos se vinculan al usuario mediante su correo electrónico (`usuario_id`), simulando una **Clave Foránea (Foreign Key)** sobre objetos JSON.
3. **Baja Lógica (Soft Delete):** Ningún registro financiero es borrado físicamente del almacenamiento. La propiedad `estado_activo` determina su visibilidad e inclusión en los totales.

---

## 🧪 3. Matriz de Casos de Prueba (IEEE 829)

| Requerimiento | ID Caso | Descripción del Escenario | Pasos / Insumos | Resultado Esperado |
|---|---|---|---|---|
| **RF-05 / Auth** | `CP-05.1` | Acceso directo a `dashboard.html` sin login. | Inserción directa de URL en la barra del navegador. | Redirección inmediata a `index.html`. |
| **RF-05** | `CP-05.2` | Carga de gasto con monto negativo o cero. | Ingresar `-200` o `0` en el campo monto. | Bloqueo por validación HTML5/JS y alerta visual. |
| **RF-05** | `CP-05.3` | Alta exitosa de gasto. | Cargar `$1500`, Fecha, Categoría y Descripción. | Registro almacenado con `estado_activo: true` y desplegado en tabla. |
| **RF-06** | `CP-06.1` | Aislamiento de datos entre cuentas. | Iniciar sesión con Usuario B habiendo datos del Usuario A. | La tabla renderiza únicamente los datos del Usuario B. |
| **RF-07** | `CP-07.1` | Edición de un registro existente. | Clic en "Editar", modificar monto y guardar. | Actualización inmediata en tabla y `localStorage` bajo el mismo ID. |
| **RF-08** | `CP-08.1` | Eliminación segura (Baja Lógica). | Clic en "Eliminar", aceptar modal de confirmación. | El gasto desaparece de la interfaz. En `localStorage` el objeto pasa a `estado_activo: false`. |
| **RF-09** | `CP-09.1` | Recálculo dinámico de total. | Inactivar o editar un gasto. | Ajuste automático e instantáneo del panel "Total Gastado". |

---

## 📋 4. Seguimiento de Tareas Técnicas

| ID Tarea | Descripción de la Tarea | Estado |
|---|---|---|
| `TSK-01` | Maquetado HTML semántico de `dashboard.html` | **Finalizado** |
| `TSK-02` | Implementación del Middleware de Seguridad en `gastos.js` | **Finalizado** |
| `TSK-03` | Lógica CRUD de Gastos con Baja Lógica en LocalStorage | **Finalizado** |
| `TSK-04` | Auditoría de Accesibilidad en Lighthouse (>90) | **Finalizado** |
