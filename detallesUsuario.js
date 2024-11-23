/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

// Obtener el parámetro de email de la URL
const params = new URLSearchParams(window.location.search);
const emailUsuario = params.get("email");

if (emailUsuario) {
    const solicitud = indexedDB.open("vitomaite04", 1);

    solicitud.onsuccess = function(evento) {
        const bd = evento.target.result;
        const transaccion = bd.transaction(["usuario", "usuario_aficion", "aficion"], "readonly");

        // Obtener el usuario
        const almacenUsuario = transaccion.objectStore("usuario");
        const solicitudUsuario = almacenUsuario.get(emailUsuario);
        solicitudUsuario.onsuccess = function(evento) {
            const usuario = evento.target.result;
            if (usuario) {
                mostrarDetalles(usuario, bd);
                mostrarMapa(usuario); // Llamada para mostrar el mapa con la ubicación del usuario
            } else {
                document.getElementById("detallesUsuario").innerText = "Usuario no encontrado.";
            }
        };

        solicitudUsuario.onerror = function() {
            console.error("Error al obtener el usuario.");
        };
    };

    solicitud.onerror = function() {
        console.error("Error al abrir la base de datos.");
    };
} else {
    document.getElementById("detallesUsuario").innerText = "No se proporcionó un email válido.";
}

function mostrarDetalles(usuario, bd) {
    const detallesContainer = document.getElementById("detallesUsuario");

    const foto = document.createElement("img");
    if (usuario.foto) {
        foto.src = usuario.foto;
    } else {
        foto.src = "";
        foto.style.backgroundColor = "#ccc"; // Fondo gris si no hay foto
    }

    const nombre = document.createElement("div");
    nombre.textContent = `Nombre: ${usuario.nombre}`;

    const edad = document.createElement("div");
    edad.textContent = `Edad: ${usuario.edad}`;

    const genero = document.createElement("div");
    genero.textContent = `Género: ${usuario.genero}`;

    const ciudad = document.createElement("div");
    ciudad.textContent = `Ciudad: ${usuario.ciudad}`;

    // Añadir elementos al contenedor
    detallesContainer.appendChild(foto);
    detallesContainer.appendChild(nombre);
    detallesContainer.appendChild(edad);
    detallesContainer.appendChild(genero);
    detallesContainer.appendChild(ciudad);

    // Obtener y mostrar las aficiones del usuario
    obtenerAficionesUsuario(usuario.email, bd);
}

function obtenerAficionesUsuario(email, bd) {
    const transaccion = bd.transaction(["usuario_aficion", "aficion"], "readonly");
    const almacenUsuarioAficion = transaccion.objectStore("usuario_aficion");
    const indicePorUsuario = almacenUsuarioAficion.index("buscarPorUsuario");

    const solicitudAficionesUsuario = indicePorUsuario.getAll(email);
    solicitudAficionesUsuario.onsuccess = function(evento) {
        const aficionesUsuario = evento.target.result;
        if (aficionesUsuario.length > 0) {
            mostrarAficiones(aficionesUsuario, bd);
        } else {
            const aficionesContainer = document.getElementById("detallesUsuario");
            const mensaje = document.createElement("div");
            mensaje.textContent = "No tiene aficiones.";
            aficionesContainer.appendChild(mensaje);
        }
    };

    solicitudAficionesUsuario.onerror = function() {
        console.error("Error al obtener las aficiones del usuario.");
    };
}

function mostrarAficiones(aficionesUsuario, bd) {
    const aficionesContainer = document.getElementById("detallesUsuario");

    const almacenAficion = bd.transaction("aficion", "readonly").objectStore("aficion");

    aficionesUsuario.forEach(aficionUsuario => {
        const solicitudAficion = almacenAficion.get(aficionUsuario.idAficion);

        solicitudAficion.onsuccess = function(evento) {
            const aficion = evento.target.result;
            if (aficion) {
                const aficionElemento = document.createElement("div");
                
                aficionElemento.textContent = `${aficion.descripcion}`;
                aficionesContainer.appendChild(aficionElemento);
            }
        };

        solicitudAficion.onerror = function() {
            console.error("Error al obtener la descripción de la afición.");
        };
    });
}

function esperarGoogleMaps(callback) {
    if (typeof google !== "undefined" && google.maps) {
        callback(); // Ejecutar la función pasada cuando Google Maps esté listo
    } else {
        setTimeout(() => esperarGoogleMaps(callback), 100); // Reintentar en 100ms
    }
}

function mostrarMapa(usuario) {
    const mapaContainer = document.getElementById("map");
    if (!usuario.latitud || !usuario.longitud) {
        mapaContainer.innerHTML = "<p>Ubicación no disponible para este usuario.</p>";
        return;
    }

    // Configurar el mapa después de confirmar que Google Maps está disponible
    esperarGoogleMaps(() => {
        const mapa = new google.maps.Map(mapaContainer, {
            center: { lat: usuario.latitud, lng: usuario.longitud },
            zoom: 14
        });

        new google.maps.Marker({
            position: { lat: usuario.latitud, lng: usuario.longitud },
            map: mapa,
            title: `Ubicación de ${usuario.nombre}`
        });
    });
}




