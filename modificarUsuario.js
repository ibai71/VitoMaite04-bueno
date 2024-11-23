/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */
function convertirImagenABase64(archivo, callback) {
    if (archivo) {
        const lector = new FileReader();
        lector.onload = function (evento) {
            callback(evento.target.result); // Imagen en base64
        };
        lector.readAsDataURL(archivo);
    } else {
        callback(null); // No se seleccionó ninguna imagen
    }
}

function modificarUsuario() {
    // Obtener el email del usuario desde sessionStorage
    const emailUsuario = sessionStorage.getItem("emailUsuario");

    if (!emailUsuario) {
        alert("No se encontró información del usuario. Por favor, inicia sesión de nuevo.");
        return;
    }

    // Obtener los nuevos valores del formulario
    const nuevaCiudad = document.getElementById("ciudad").value;
    const archivoFoto = document.getElementById("foto").files[0];

    // Iniciar una transacción de lectura en la colección "usuario"
    const transaccion = bd.transaction(["usuario"], "readonly");
    const almacen = transaccion.objectStore("usuario");

    // Buscar el usuario por su email
    const solicitud = almacen.get(emailUsuario);

    solicitud.onsuccess = function (evento) {
        const usuario = evento.target.result;

        if (usuario) {
            // Actualizar los campos solo si hay nuevos valores proporcionados
            if (nuevaCiudad) {
                usuario.ciudad = nuevaCiudad;
            }

            if (archivoFoto) {
                // Convertir la foto a base64
                convertirImagenABase64(archivoFoto, function (fotoBase64) {
                    if (fotoBase64) {
                        usuario.foto = fotoBase64; // Actualizar la foto en base64
                    }

                    // Guardar los cambios en una nueva transacción
                    const nuevaTransaccion = bd.transaction(["usuario"], "readwrite");
                    const nuevoAlmacen = nuevaTransaccion.objectStore("usuario");
                    guardarCambiosUsuario(usuario, nuevoAlmacen);
                });
            } else {
                // Guardar los cambios en una nueva transacción
                const nuevaTransaccion = bd.transaction(["usuario"], "readwrite");
                const nuevoAlmacen = nuevaTransaccion.objectStore("usuario");
                guardarCambiosUsuario(usuario, nuevoAlmacen);
            }
        } else {
            alert("Usuario no encontrado.");
        }
    };

    solicitud.onerror = function (evento) {
        console.error("Error al buscar el usuario:", evento.target.error);
        alert("Hubo un error al buscar el usuario.");
    };
}



function guardarCambiosUsuario(usuario, almacen) {
    // Guardar los cambios en la base de datos
    const solicitudActualizar = almacen.put(usuario);

    solicitudActualizar.onsuccess = function () {
        
        alert("Usuario modificado exitosamente.");
    };

    solicitudActualizar.onerror = function (evento) {
        console.error("Error al actualizar el usuario:", evento.target.error);
        alert("Hubo un error al guardar los cambios.");
    };
}

document.getElementById("foto").addEventListener("change", function (evento) {
    const archivo = evento.target.files[0]; // Archivo seleccionado
    const preview = document.getElementById("preview");

    if (archivo) {
        const lector = new FileReader();
        lector.onload = function (evento) {
            preview.src = evento.target.result; // Mostrar la imagen cargada
            preview.style.display = "block"; // Asegurarse de que sea visible
        };
        lector.readAsDataURL(archivo);
    } else {
        preview.src = ""; // Eliminar la previsualización si no hay imagen
        preview.style.display = "none";
    }
});



