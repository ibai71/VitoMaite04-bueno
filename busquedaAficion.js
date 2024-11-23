/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const aficionesSeleccionadas = params.getAll("aficiones"); // IDs de aficiones seleccionadas
    mostrarResultados(aficionesSeleccionadas);
});

function mostrarResultados(aficionesSeleccionadas) {
    if (!aficionesSeleccionadas || aficionesSeleccionadas.length === 0) {
        document.getElementById("resultados").innerHTML = "<p>No se seleccionaron aficiones.</p>";
        return;
    }

    const solicitud = indexedDB.open("vitomaite04", 1);

    solicitud.onsuccess = function (evento) {
        const bd = evento.target.result;
        const transaccion = bd.transaction(["usuario", "usuario_aficion"], "readonly");
        const almacenUsuarios = transaccion.objectStore("usuario");
        const almacenUsuarioAficion = transaccion.objectStore("usuario_aficion");

        const usuariosConAficion = new Set();

        const cursor = almacenUsuarioAficion.openCursor();
        cursor.onsuccess = function (evento) {
            const cursor = evento.target.result;
            if (cursor) {
                if (aficionesSeleccionadas.includes(String(cursor.value.idAficion))) {
                    usuariosConAficion.add(cursor.value.idUsuario);
                }
                cursor.continue();
            } else {
                // Todos los usuarios con las aficiones seleccionadas han sido recogidos
                cargarUsuarios([...usuariosConAficion], almacenUsuarios);
            }
        };
    };

    solicitud.onerror = function () {
        console.error("Error al abrir la base de datos.");
    };
}

function cargarUsuarios(usuariosIds, almacenUsuarios) {
    const resultadosContainer = document.getElementById("resultados");
    resultadosContainer.innerHTML = "";

    if (usuariosIds.length === 0) {
        resultadosContainer.innerHTML = "<p>No se encontraron usuarios con las aficiones seleccionadas.</p>";
        return;
    }

    usuariosIds.forEach((idUsuario) => {
        const solicitud = almacenUsuarios.get(idUsuario);

        solicitud.onsuccess = function (evento) {
            const usuario = evento.target.result;

            if (usuario) {
                // Crear un div para el usuario
                const usuarioDiv = document.createElement("div");
                usuarioDiv.className = "usuario";

                // Crear imagen o fondo gris
                const foto = document.createElement("img");
                foto.classList.add("resultado-foto2");
                if (usuario.foto) {
                    foto.src = usuario.foto;
                
                } else {
                    foto.src = ""; 
                    foto.style.backgroundColor = "#ccc";
                }
                foto.addEventListener("click", function() {
                window.location.href = `detallesUsuario.html?email=${encodeURIComponent(usuario.email)}`;
            });

                // Nombre y edad
                const nombreEdad = document.createElement("p");
                nombreEdad.textContent = `${usuario.nombre}, ${usuario.edad} años`;

                // Agregar elementos al contenedor del usuario
                usuarioDiv.appendChild(foto);
                usuarioDiv.appendChild(nombreEdad);
                resultadosContainer.appendChild(usuarioDiv);
            }
        };

        solicitud.onerror = function () {
            console.error("Error al obtener el usuario:", idUsuario);
        };
    });
}

