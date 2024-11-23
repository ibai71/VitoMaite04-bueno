/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

document.addEventListener("DOMContentLoaded", function() {
    const aficionesContainer = document.getElementById("aficionesContainer");
    const aficionesForm = document.getElementById("aficionesForm");

    let usuarioEmail = sessionStorage.getItem("emailUsuario"); // Obtener el email del usuario logueado
    if (!usuarioEmail) {
        alert("Usuario no logueado. Por favor, inicia sesión.");
        return;
    }

    // Iniciar la base de datos
    const solicitud = indexedDB.open("vitomaite04", 1);
    let bd;

    solicitud.onsuccess = function(evento) {
        bd = evento.target.result;
        cargarAficionesUsuario();
    };

    solicitud.onerror = function(evento) {
        console.error("Error al abrir la base de datos:", evento.target.error);
    };

    function cargarAficionesUsuario() {
        const transaccion = bd.transaction(["aficion", "usuario_aficion"], "readonly");
        const almacenAficion = transaccion.objectStore("aficion");
        const almacenUsuarioAficion = transaccion.objectStore("usuario_aficion");

        // Obtener todas las aficiones del usuario
        const aficionesUsuarioSolicitud = almacenUsuarioAficion.index("buscarPorUsuario").getAll(usuarioEmail);

        aficionesUsuarioSolicitud.onsuccess = function() {
            const aficionesUsuario = aficionesUsuarioSolicitud.result;

            if (aficionesUsuario.length === 0) {
                aficionesContainer.innerHTML = "<p>No tienes aficiones registradas.</p>";
                return;
            }

            const idsAficionesUsuario = aficionesUsuario.map(ua => ua.idAficion);

            // Obtener todas las aficiones para mostrar sólo las que el usuario tiene
            const todasAficionesSolicitud = almacenAficion.getAll();

            todasAficionesSolicitud.onsuccess = function() {
                const todasAficiones = todasAficionesSolicitud.result;
                const aficionesDisponibles = todasAficiones.filter(aficion => idsAficionesUsuario.includes(aficion.idAficion));

                aficionesContainer.innerHTML = "";
                aficionesDisponibles.forEach(aficion => {
                    const label = document.createElement("label");
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.value = aficion.idAficion;
                    label.appendChild(checkbox);
                    label.appendChild(document.createTextNode(aficion.descripcion));
                    aficionesContainer.appendChild(label);
                    aficionesContainer.appendChild(document.createElement("br"));
                });
            };

            todasAficionesSolicitud.onerror = function() {
                console.error("Error al cargar las aficiones disponibles:", todasAficionesSolicitud.error);
            };
        };

        aficionesUsuarioSolicitud.onerror = function() {
            console.error("Error al cargar las aficiones del usuario:", aficionesUsuarioSolicitud.error);
        };
    }

    aficionesForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Evitar el envío del formulario

        const aficionesSeleccionadas = Array.from(aficionesContainer.querySelectorAll("input[type='checkbox']:checked"))
            .map(checkbox => parseInt(checkbox.value, 10));

        if (aficionesSeleccionadas.length === 0) {
            alert("Por favor, selecciona al menos una afición para eliminar.");
            return;
        }

        // Eliminar las aficiones seleccionadas del almacén de objetos usuario_aficion
        const transaccion = bd.transaction(["usuario_aficion"], "readwrite");
        const almacenUsuarioAficion = transaccion.objectStore("usuario_aficion");

        aficionesSeleccionadas.forEach(idAficion => {
            // Buscar y eliminar las aficiones del usuario
            const solicitudEliminar = almacenUsuarioAficion.index("buscarPorUsuario").openCursor();
            solicitudEliminar.onsuccess = function(evento) {
                const cursor = evento.target.result;
                if (cursor) {
                    if (cursor.value.idUsuario === usuarioEmail && cursor.value.idAficion === idAficion) {
                        cursor.delete();
                    }
                    cursor.continue();
                }
            };
        });

        transaccion.oncomplete = function() {
            alert("Aficiones eliminadas exitosamente.");
            location.reload(); // Recargar la página para actualizar la lista de aficiones
        };

        transaccion.onerror = function(evento) {
            console.error("Error al eliminar las aficiones:", evento.target.error);
        };
    });
});

