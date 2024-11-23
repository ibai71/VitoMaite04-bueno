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
        cargarAficiones();
    };

    solicitud.onerror = function(evento) {
        console.error("Error al abrir la base de datos:", evento.target.error);
    };

    function cargarAficiones() {
        const transaccion = bd.transaction(["aficion", "usuario_aficion"], "readonly");
        const almacenAficion = transaccion.objectStore("aficion");
        const almacenUsuarioAficion = transaccion.objectStore("usuario_aficion");

        // Obtener todas las aficiones
        const todasAficionesSolicitud = almacenAficion.getAll();

        // Obtener todas las aficiones del usuario
        const aficionesUsuarioSolicitud = almacenUsuarioAficion.index("buscarPorUsuario").getAll(usuarioEmail);

        // Manejar las solicitudes usando Promise.all
        Promise.all([
            new Promise((resolve, reject) => {
                todasAficionesSolicitud.onsuccess = () => resolve(todasAficionesSolicitud.result);
                todasAficionesSolicitud.onerror = () => reject(todasAficionesSolicitud.error);
            }),
            new Promise((resolve, reject) => {
                aficionesUsuarioSolicitud.onsuccess = () => resolve(aficionesUsuarioSolicitud.result);
                aficionesUsuarioSolicitud.onerror = () => reject(aficionesUsuarioSolicitud.error);
            })
        ]).then(([todasAficiones, aficionesUsuario]) => {
            // Asegúrate de que aficionesUsuario es un array antes de llamar a map
            if (!Array.isArray(aficionesUsuario)) {
                aficionesUsuario = []; // Asegúrate de que sea un array vacío si no es iterable
            }

            const idsAficionesUsuario = aficionesUsuario.map(ua => ua.idAficion);

            // Filtrar las aficiones que el usuario aún no tiene
            const aficionesDisponibles = todasAficiones.filter(aficion => !idsAficionesUsuario.includes(aficion.idAficion));

            // Mostrar las aficiones disponibles
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
        }).catch(error => {
            console.error("Error al cargar las aficiones:", error);
        });
    }

    aficionesForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Evitar el envío del formulario

        const aficionesSeleccionadas = Array.from(aficionesContainer.querySelectorAll("input[type='checkbox']:checked"))
            .map(checkbox => parseInt(checkbox.value, 10));

        if (aficionesSeleccionadas.length === 0) {
            alert("Por favor, selecciona al menos una afición para añadir.");
            return;
        }

        // Añadir las aficiones seleccionadas al almacén de objetos usuario_aficion
        const transaccion = bd.transaction(["usuario_aficion"], "readwrite");
        const almacenUsuarioAficion = transaccion.objectStore("usuario_aficion");

        aficionesSeleccionadas.forEach(idAficion => {
            const nuevaAficionUsuario = { id: Date.now() + idAficion, idUsuario: usuarioEmail, idAficion: idAficion };
            almacenUsuarioAficion.add(nuevaAficionUsuario);
        });

        transaccion.oncomplete = function() {
            alert("Aficiones añadidas exitosamente.");
            // Opcional: redirigir a otra página o actualizar la lista de aficiones del usuario
        };

        transaccion.onerror = function(evento) {
            console.error("Error al añadir aficiones:", evento.target.error);
        };
    });
});


