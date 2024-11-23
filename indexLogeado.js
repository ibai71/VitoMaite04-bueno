/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

document.addEventListener("DOMContentLoaded", function () {
    cargarAficiones();
});

function cargarAficiones() {
    var solicitud = indexedDB.open("vitomaite04", 1);

    solicitud.onsuccess = function (evento) {
        var bd = evento.target.result;
        var transaccion = bd.transaction(["aficion"], "readonly");
        var almacen = transaccion.objectStore("aficion");
        var solicitudAficiones = almacen.getAll();

        solicitudAficiones.onsuccess = function (evento) {
            var aficiones = evento.target.result;
            var listaAficiones = document.getElementById("lista-aficiones");

            aficiones.forEach(function (aficion) {
                // Crear un checkbox para cada afición
                var checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.name = "aficiones";
                checkbox.value = aficion.idAficion;
                checkbox.id = `aficion-${aficion.idAficion}`;

                // Crear una etiqueta para el checkbox
                var label = document.createElement("label");
                label.htmlFor = `aficion-${aficion.idAficion}`;
                label.textContent = aficion.descripcion;

                // Añadir el checkbox y la etiqueta al contenedor
                var div = document.createElement("div");
                div.appendChild(checkbox);
                div.appendChild(label);
                listaAficiones.appendChild(div);
            });
        };

        solicitudAficiones.onerror = function () {
            console.error("Error al cargar las aficiones.");
        };
    };

    solicitud.onerror = function () {
        console.error("Error al abrir la base de datos.");
    };
    
    
}

function redirigirBusqueda() {
    // Obtener las aficiones seleccionadas
    var checkboxes = document.querySelectorAll('#lista-aficiones input[type="checkbox"]:checked');
    var aficionesSeleccionadas = Array.from(checkboxes).map(cb => cb.value);

    if (aficionesSeleccionadas.length === 0) {
        alert("Por favor, selecciona al menos una afición para buscar.");
        return;
    }

    // Crear la URL con las aficiones como parámetros
    var params = new URLSearchParams();
    aficionesSeleccionadas.forEach(id => params.append("aficiones", id));

    // Redirigir a la página de búsqueda con los parámetros
    window.location.href = "busquedaAficion.html?" + params.toString();
}



