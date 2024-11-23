/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


document.addEventListener("DOMContentLoaded", function() {
    var bd;
    
    // Obtiene el email del usuario logeado desde sessionStorage
    const usuarioLogeado = sessionStorage.getItem("emailUsuario");
    console.log("Email del usuario logueado:", usuarioLogeado);
    if (!usuarioLogeado) {
        console.error("No hay un usuario logeado en sessionStorage.");
        return;
    }

    // Abre la base de datos
    var solicitud = indexedDB.open("vitomaite04", 1);

    solicitud.onsuccess = function(event) {
        bd = event.target.result;
        mostrarLikes();
    };

    solicitud.onerror = function(event) {
        console.error("Error al abrir la base de datos:", event.target.error);
    };

    function mostrarLikes() {
    var transaccion = bd.transaction(["meGusta", "usuario"], "readonly");
    var almacenMeGusta = transaccion.objectStore("meGusta");

    var meGustanAmi = [];
    var lesGusto = [];

    almacenMeGusta.openCursor().onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            if (cursor.value.idUsuarioMeGusta === usuarioLogeado) {
                lesGusto.push(cursor.value.idUsuario);
            }
            if (cursor.value.idUsuario === usuarioLogeado) {
                meGustanAmi.push(cursor.value.idUsuarioMeGusta);
            }
            cursor.continue();
        } else {
            console.log("Les gusto:", lesGusto); // Aquí para ver el resultado
            console.log("Me gustan a mí:", meGustanAmi); // Aquí también
            mostrarCandidatos(lesGusto, meGustanAmi);
        }
    };
}


    function mostrarCandidatos(lesGusto, meGustanAmi) {
    var listaCandidatos = document.getElementById("listaCandidatos");
    listaCandidatos.innerHTML = "";

    var transaccion = bd.transaction("usuario", "readonly");
    var almacenUsuario = transaccion.objectStore("usuario");

    lesGusto.forEach(function(email) {
        var solicitud = almacenUsuario.get(email);
        solicitud.onsuccess = function(event) {
            var usuario = event.target.result;
            if (usuario) {
                var div = document.createElement("div");
                div.className = "candidato";
                div.textContent = usuario.nombre + " (" + usuario.email + ")";

                // Verificar si el like es recíproco
                if (meGustanAmi.includes(email)) {
                    var corazon = document.createElement("span");
                    corazon.className = "corazon";
                    corazon.textContent = " ❤️";
                    div.appendChild(corazon);
                }

                listaCandidatos.appendChild(div);
            }
        };
    });
}

});
