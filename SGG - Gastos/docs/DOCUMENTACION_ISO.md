# Documentación Técnica de Ingeniería de Software — SGG (Budget Tracker)

* **Proyecto:** Sistema de Gestión de Gastos (SGG) — Refactorización v2.0
* **Repositorio:** `kiarafalcon85-lang/SGG-Gestion-de-Gastos`
* **Rama de desarrollo:** `feature/refactor-sqlite-Falcon`
* **Autora:** Kiara Falcón
* **Estándares aplicados:** ISO/IEC/IEEE 29148 (ERS) e ISO/IEC/IEEE 29119-3 (Documentación de Pruebas)

---

## Parte I: Especificación de Requisitos de Software (Norma ISO/IEC/IEEE 29148)

### 1. Introducción

#### 1.1 Propósito
Definir los requisitos funcionales, no funcionales, arquitectura de datos y casos de uso de la versión 2.0 del **Sistema de Gestión de Gastos (SGG)**, tras su refactorización desde almacenamiento plano (`localStorage`) hacia una arquitectura relacional *Local-First* con respaldo en la nube.

#### 1.2 Alcance y Arquitectura del Sistema
El sistema es una aplicación web cliente (*Single Page Dashboard*) estructurada modularmente:
* **`dashboard.html`:** Interfaz principal, carga de dependencias (`sql-wasm.js` v1.10.3, `chart.umd.min.js` v4.4.4, `@supabase/supabase-js@2`) y contenedores visuales.
* **`css/style.css`:** Hojas de estilo con identidad visual *Coquette*, soporte para tema Claro/Oscuro y diseño responsivo.
* **`js/config.js`:** Módulo centralizado de credenciales y parámetros (`SGG_CONFIG`).
* **`js/db.js`:** Motor de base de datos relacional en WebAssembly (**SQLite**) con persistencia binaria en **OPFS** (*Origin Private File System*, archivo `sgg_database.sqlite`).
* **`js/cloud.js`:** Integración con servicios externos (**API REST de ImgBB** para alojamiento de imágenes y **Supabase Storage** en el bucket `sgg-backups` para respaldos de base de datos).
* **`js/gastos.js`:** Lógica de negocio, consultas SQL, validación de formularios, renderizado de tabla y actualización de gráficos estadísticos.

---

### 2. Requisitos Funcionales (RF)

| ID | Nombre | Descripción detallada | Prioridad |
| :--- | :--- | :--- | :--- |
| **RF-01** | Gestión de sesión y perfil | El sistema debe permitir el inicio y cierre de sesión por usuario, así como la modificación de su apodo visible mediante un modal interactivo. | Alta |
| **RF-02** | Registro de movimientos | El usuario debe poder registrar ingresos y egresos especificando tipo, monto numérico positivo, categoría, descripción, fecha y un archivo de imagen opcional como comprobante. | Alta |
| **RF-03** | Persistencia relacional SQLite + OPFS | Toda operación de lectura o escritura debe ejecutarse mediante sentencias SQL sobre `sql.js`, persistiendo el volcado binario en el archivo `sgg_database.sqlite` dentro de OPFS. | Alta |
| **RF-04** | Alojamiento externo de comprobantes | Al adjuntar una imagen en un movimiento, el sistema debe subirla mediante `POST` a la API de ImgBB y almacenar únicamente la URL pública resultante en la tabla SQLite. | Alta |
| **RF-05** | Borrado lógico (*Soft Delete*) | Al eliminar un movimiento, el sistema no debe ejecutar `DELETE` físico, sino actualizar la columna `deleted_at` con la marca temporal actual, excluyendo el registro de las vistas y cálculos activos (`WHERE deleted_at IS NULL`). | Alta |
| **RF-06** | Cálculo dinámico de balances | El sistema debe calcular en tiempo real el Total de Ingresos, Total de Egresos y Balance Disponible mediante funciones de agregación SQL (`SUM`) sobre registros activos. | Alta |
| **RF-07** | Visualización estadística | El sistema debe renderizar y actualizar dinámicamente gráficos interactivos con **Chart.js** mostrando la distribución financiera del usuario. | Media |
| **RF-08** | Sincronización en la nube | Ante cambios en la base de datos local, el sistema debe exportar el binario `.sqlite` y subirlo al bucket `sgg-backups` de **Supabase Storage** bajo una ruta aislada por usuario. | Alta |
| **RF-09** | Alternancia de tema visual | El usuario debe poder alternar entre Modo Claro y Modo Oscuro desde la barra superior sin perder la sesión ni el estado de la interfaz. | Baja |

---

### 3. Requisitos No Funcionales (RNF)

| ID | Categoría | Especificación |
| :--- | :--- | :--- |
| **RNF-01** | Capacidad y Escalabilidad | Superar la restricción de ~5 MB de `localStorage` evitando almacenar imágenes en Base64 dentro de la base de datos local y delegando binarios multimedia a ImgBB. |
| **RNF-02** | Disponibilidad (*Local-First*) | Garantizar la lectura y registro de datos locales mediante SQLite/OPFS incluso ante cortes temporales de conectividad a Internet. |
| **RNF-03** | Mantenibilidad y Seguridad | Aislar claves de API (`IMGBB_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`) en `js/config.js`, separándolas de la lógica de negocio y presentación. |
| **RNF-04** | Usabilidad | Proveer retroalimentación clara al usuario ante errores de validación o red mediante alertas modales no intrusivas (`#msg-box`). |

---

### 4. Casos de Uso Principales (CU)

#### CU-01: Registrar movimiento financiero con comprobante
* **Actor:** Usuario autenticado.
* **Precondiciones:** Sesión iniciada; base de datos `sgg_database.sqlite` inicializada en OPFS; credenciales válidas en `js/config.js`.
* **Flujo Principal:**
  1. El usuario completa el formulario con tipo (Ingreso/Gasto), monto, categoría, descripción y selecciona una imagen de comprobante.
  2. El usuario confirma el envío.
  3. El sistema valida que los campos obligatorios sean correctos y el monto sea mayor a cero.
  4. El módulo `cloud.js` envía la imagen a la API de ImgBB y obtiene la URL directa.
  5. El módulo `db.js` inserta el registro en SQLite (incluyendo la URL de ImgBB y `deleted_at = NULL`) y guarda el binario en OPFS.
  6. El sistema sincroniza el archivo `sgg_database.sqlite` con el bucket `sgg-backups` en Supabase Storage.
  7. Se actualizan la tabla de movimientos, las tarjetas de balance y los gráficos de Chart.js.
* **Flujo Alternativo (Sin imagen):** Si no se adjunta archivo, se omite el paso 4 y se almacena `NULL` en el campo de comprobante.

#### CU-02: Eliminar movimiento mediante borrado lógico
* **Actor:** Usuario autenticado.
* **Precondiciones:** Existe al menos un movimiento activo en pantalla.
* **Flujo Principal:**
  1. El usuario presiona la acción de eliminar sobre un movimiento listado.
  2. El sistema ejecuta `UPDATE` asignando la fecha/hora actual en `deleted_at`.
  3. Se persiste el archivo binario en OPFS y se sincroniza el respaldo con Supabase.
  4. El movimiento desaparece de la tabla principal y los totales y gráficos se recalculan automáticamente.

---

## Parte II: Plan y Matriz de Trazabilidad de Pruebas (Norma ISO/IEC/IEEE 29119-3)

### 1. Estrategia y Entorno de Ejecución
Las pruebas se ejecutaron bajo enfoque funcional de caja negra y verificación estructural de persistencia en entorno local servido por HTTP (`VS Code Live Server`), inspeccionando:
1. **Almacenamiento OPFS:** Verificación de creación y actualización del binario `sgg_database.sqlite` mediante DevTools.
2. **Tráfico de Red (Fetch/XHR):** Verificación de respuestas HTTP `200 OK` en las peticiones hacia `api.imgbb.com` y `supabase.co/storage/v1/object/sgg-backups`.
3. **Integridad de UI:** Validación de recálculo SQL y renderizado de canvas en Chart.js.

---

### 2. Matriz de Trazabilidad (Requisitos ↔ Casos de Uso ↔ Pruebas)

| Requisito | Caso de Uso | Caso de Prueba | Descripción de la Verificación |
| :--- | :--- | :--- | :--- |
| **RF-01** | — | **CP-01** | Inicio de sesión, edición de apodo y cierre de sesión. |
| **RF-02, RF-03** | CU-01 | **CP-02** | Alta de movimiento sin imagen y persistencia en `sgg_database.sqlite` (OPFS) tras recargar F5. |
| **RF-04, RNF-01** | CU-01 | **CP-03** | Alta de movimiento con comprobante JPG/PNG, subida a ImgBB y apertura de URL externa. |
| **RF-05** | CU-02 | **CP-04** | Eliminación de registro verificando `deleted_at IS NOT NULL` en SQLite y exclusión en UI. |
| **RF-06, RF-07** | CU-01, CU-02 | **CP-05** | Consistencia matemática entre tarjetas de balance SQL y gráficos Chart.js tras altas/bajas. |
| **RF-08** | CU-01, CU-02 | **CP-06** | Carga automática del binario `sgg_database.sqlite` en el bucket `sgg-backups` de Supabase. |
| **RNF-04** | CU-01 | **CP-07** | Validación de formularios ante montos negativos, vacíos o cero mostrando `#msg-box`. |
| **RF-09** | — | **CP-08** | Alternancia entre Modo Claro y Modo Oscuro preservando legibilidad y gráficos. |

---

### 3. Registro de Ejecución de Casos de Prueba

| ID | Título del Caso de Prueba | Precondiciones | Pasos de Ejecución | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CP-01** | Gestión de sesión y cambio de apodo | Aplicación abierta en `dashboard.html`. | 1. Ingresar credenciales de usuario.<br>2. Abrir modal "Cambiar Apodo", ingresar nuevo nombre y guardar.<br>3. Presionar "Cerrar Sesión". | El apodo se actualiza en el encabezado y al cerrar sesión se oculta el panel privado. | **APROBADO** |
| **CP-02** | Persistencia relacional en OPFS | Sesión iniciada. | 1. Registrar un ingreso de `$50000` sin foto.<br>2. Recargar la página con `F5`. | El movimiento sigue visible tras recargar y el archivo `sgg_database.sqlite` existe en OPFS. | **APROBADO** |
| **CP-03** | Subida de comprobante a ImgBB | Conexión a Internet y `IMGBB_API_KEY` válida. | 1. Registrar un gasto de `$12500` adjuntando una imagen.<br>2. Hacer clic en "Ver Foto" en la tabla. | La imagen se sube a ImgBB, se guarda su URL en SQLite y el enlace abre la foto en una pestaña nueva. | **APROBADO** |
| **CP-04** | Borrado lógico (`deleted_at`) | Al menos un movimiento registrado. | 1. Presionar eliminar en un gasto de `$12500`.<br>2. Consultar la tabla `movimientos` en SQLite. | El registro deja de verse en pantalla, el saldo sube `$12500`, pero la fila conserva sus datos en SQLite con fecha en `deleted_at`. | **APROBADO** |
| **CP-05** | Sincronización de balances y Chart.js | Movimientos de ingresos y egresos activos. | 1. Registrar 2 gastos de distintas categorías y 1 ingreso.<br>2. Comparar totales con el gráfico. | El saldo neto coincide exactamente con `Ingresos - Egresos` y el gráfico refleja las proporciones correctas. | **APROBADO** |
| **CP-06** | Respaldo binario en Supabase Storage | Bucket `sgg-backups` configurado con políticas RLS. | 1. Guardar un movimiento.<br>2. Ingresar al panel de Storage en Supabase. | Se crea/actualiza el archivo `sgg_database.sqlite` dentro de la carpeta del usuario en `sgg-backups`. | **APROBADO** |
| **CP-07** | Validación de datos inválidos | Formulario de movimientos visible. | 1. Intentar guardar un movimiento con monto `0` o `-100` o descripción vacía. | El sistema bloquea la inserción en SQLite y muestra el aviso de error en `#msg-box`. | **APROBADO** |
| **CP-08** | Cambio de tema Claro / Oscuro | Dashboard cargado. | 1. Presionar el botón `Modo Oscuro` en el header.<br>2. Volver a presionar `Modo Claro`. | La clase del `body` alterna correctamente adaptando tarjetas, tabla y modales sin errores visuales. | **APROBADO** |
