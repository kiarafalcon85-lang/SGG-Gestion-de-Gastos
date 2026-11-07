// CARGAR FOTO ÚNICA POR CORREO
    function cargarAvatarUsuario() {
        const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));
        const avatarImg = document.getElementById("profile-avatar-img");
        
        if (!avatarImg || !usuarioActivo) return;

        const avatarGuardado = localStorage.getItem(`sgg_avatar_${usuarioActivo.email}`);
        if (avatarGuardado) {
            avatarImg.src = avatarGuardado;
        } else {
            avatarImg.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop";
        }
    }

    // CAMBIAR Y GUARDAR FOTO
    const inputAvatar = document.getElementById("input-avatar");
    if (inputAvatar) {
        inputAvatar.addEventListener("change", (e) => {
            const usuarioActivo = JSON.parse(localStorage.getItem("usuario_activo_sgg"));
            if (!usuarioActivo) return;

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

    // CAMBIAR COLOR PASTEL Y FONDO DE LA PÁGINA
    const colorBtns = document.querySelectorAll(".color-btn");
    const temaGuardado = localStorage.getItem("sgg_color_theme");

    if (temaGuardado) {
        document.body.classList.add(`theme-${temaGuardado}`);
    }

    colorBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const selectedTheme = btn.getAttribute("data-color");
            document.body.classList.remove("theme-purple", "theme-blue", "theme-mint", "theme-peach");
            if (selectedTheme !== "pink") {
                document.body.classList.add(`theme-${selectedTheme}`);
            }
            localStorage.setItem("sgg_color_theme", selectedTheme);
        });
    });
