/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

document.addEventListener("DOMContentLoaded", function() {
    // Obtén el email del usuario logeado desde sessionStorage
    var emailUsuario = sessionStorage.getItem("emailUsuario");
    var nombreUsuario = sessionStorage.getItem("nombreUsuario");

    // Verifica si hay un usuario logeado
    if (emailUsuario && nombreUsuario) {
        // Muestra el nombre del usuario
        document.getElementById("user-name").textContent = "Hola " + nombreUsuario + "!";

        // Abre la base de datos y busca la foto del usuario
        var solicitud = indexedDB.open("vitomaite04", 1);

        solicitud.onsuccess = function(evento) {
            var bd = evento.target.result;
            var transaccion = bd.transaction(["usuario"], "readonly");
            var almacen = transaccion.objectStore("usuario");
            var solicitudUsuario = almacen.get(emailUsuario);

            solicitudUsuario.onsuccess = function(event) {
                var usuario = event.target.result;

                if (usuario && usuario.foto) {
                    // Si el usuario tiene foto en base64, muéstrala
                    document.getElementById("user-photo").src = usuario.foto;
                } else {
                    // Si no hay foto, usa el fondo gris definido en CSS
                    document.getElementById("user-photo").src = "";
                }
            };

            solicitudUsuario.onerror = function() {
                console.error("Error al obtener el usuario de la base de datos.");
            };
        };

        solicitud.onerror = function() {
            console.error("Error al abrir la base de datos.");
        };
    } else {
        console.warn("No hay usuario logeado en sessionStorage.");
    }
});

