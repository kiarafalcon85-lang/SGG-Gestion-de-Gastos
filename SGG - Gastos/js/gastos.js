<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SGG - Autenticación</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body class="light-mode">

    <header class="top-bar">
        <h1>SGG - Gestión de Gastos</h1>
        <button id="theme-toggle" class="btn-theme">🌙 Modo Oscuro</button>
    </header>

    <main class="auth-container">
        <!-- Notificación para el Profesor -->
        <div class="demo-info">
            <p><strong>📌 Credenciales para Corrección del Profesor:</strong></p>
            <p><strong>Usuario / Email:</strong> admin@profesor.com</p>
            <p><strong>Contraseña:</strong> 123456</p>
        </div>

        <div class="auth-card">
            <!-- Formulario de Login -->
            <form id="form-login" class="auth-form">
                <h2>Iniciar Sesión</h2>
                <div class="input-group">
                    <label for="login-email">Correo Electrónico</label>
                    <input type="email" id="login-email" required placeholder="admin@profesor.com">
                </div>
                <div class="input-group">
                    <label for="login-password">Contraseña</label>
                    <input type="password" id="login-password" required placeholder="••••••">
                </div>
                <button type="submit" class="btn-primary">Ingresar</button>
                <p class="switch-auth">¿No tienes una cuenta? <a href="#" id="go-to-register">Regístrate aquí</a></p>
            </form>

            <!-- Formulario de Registro -->
            <form id="form-register" class="auth-form hidden">
                <h2>Crear Cuenta</h2>
                <div class="input-group">
                    <label for="reg-nombre">Nombre Completo</label>
                    <input type="text" id="reg-nombre" required placeholder="Tu Nombre">
                </div>
                <div class="input-group">
                    <label for="reg-email">Correo Electrónico</label>
                    <input type="email" id="reg-email" required placeholder="correo@ejemplo.com">
                </div>
                <div class="input-group">
                    <label for="reg-password">Contraseña</label>
                    <input type="password" id="reg-password" required placeholder="••••••">
                </div>
                <button type="submit" class="btn-primary">Registrarse</button>
                <p class="switch-auth">¿Ya tienes cuenta? <a href="#" id="go-to-login">Inicia sesión</a></p>
            </form>
        </div>
    </main>

    <script src="js/auth.js"></script>
</body>
</html>
