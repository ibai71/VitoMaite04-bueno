/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

function iniciarBD() {
    const solicitud = indexedDB.open("vitomaite04", 1);
    console.log("Intentando abrir la base de datos...");
    

    solicitud.onsuccess = function(evento) {
        bd = evento.target.result;
        console.log("Base de datos abierta exitosamente", bd);

        // Llamar a cargarResultadosBusqueda solo cuando la base de datos esté disponible
        cargarResultadosBusqueda();
    };

    solicitud.onerror = function(evento) {
        console.error("Error al abrir la base de datos:", evento.target.error);
    };

    solicitud.onupgradeneeded = function(evento) {
        bd = evento.target.result;
        console.log("Actualizando la base de datos (onupgradeneeded)");
        // Configura los object stores aquí si es necesario
    };
}

// Llamar a iniciarBD al cargar la página
window.addEventListener("load", iniciarBD);

function cargarResultadosBusqueda() {
    console.log("Intentando cargar resultados de búsqueda...");
    const emailUsuarioLogueado = sessionStorage.getItem("emailUsuario");

    if (!bd) {
        console.error("La base de datos no está disponible.");
        return;
    }
    
    console.log("Base de datos disponible, continuando con la búsqueda...");

    // Obtener los criterios de búsqueda de sessionStorage
    const ciudad = sessionStorage.getItem("busquedaCiudad");
    const genero = sessionStorage.getItem("busquedaGenero");
    const rangoEdad = sessionStorage.getItem("busquedaEdad");
    console.log("Criterios de búsqueda:", { ciudad, genero, rangoEdad });

    const resultadosContainer = document.getElementById("resultadosContainer");
    if (!resultadosContainer) {
        console.error("No se encontró el contenedor de resultados.");
        return;
    }

    // Iniciar una transacción de solo lectura
    const transaccion = bd.transaction(["usuario"], "readonly");
    const almacen = transaccion.objectStore("usuario");

    const solicitud = almacen.getAll();
    console.log("Solicitud de obtener todos los usuarios realizada.");

    solicitud.onsuccess = function(evento) {
        const usuarios = evento.target.result;
        console.log("Usuarios obtenidos de la base de datos:", usuarios);

        const resultadosFiltrados = usuarios.filter(usuario => {
            const edadUsuario = parseInt(usuario.edad, 10);
            return (
                usuario.email !== emailUsuarioLogueado &&
                (ciudad === "" || usuario.ciudad.toLowerCase() === ciudad.toLowerCase()) &&
                (genero === "ambos" || usuario.genero.toLowerCase() === genero.toLowerCase()) &&
                filtrarPorRangoEdad(edadUsuario, rangoEdad)
            );
        });

        console.log("Resultados filtrados:", resultadosFiltrados);

        // Limpiar el contenedor antes de añadir nuevos resultados
        resultadosContainer.innerHTML = "";

        if (resultadosFiltrados.length === 0) {
            console.log("No se encontraron resultados.");
            resultadosContainer.innerHTML = "<p>No se encontraron resultados.</p>";
            return;
        }

        // Mostrar los resultados
        resultadosFiltrados.forEach(usuario => {
            const item = document.createElement("div");
            item.classList.add("resultado-item");

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

            const nombre = document.createElement("div");
            nombre.classList.add("resultado-nombre");
            nombre.textContent = `${usuario.nombre}, ${usuario.edad}`;

            item.appendChild(foto);
            item.appendChild(nombre);
            resultadosContainer.appendChild(item);
        });
    };

    solicitud.onerror = function(evento) {
        console.error("Error al cargar los usuarios:", evento.target.error);
    };
}

function filtrarPorRangoEdad(edad, rango) {
    switch (rango) {
        case "18-25":
            return edad >= 18 && edad <= 25;
        case "26-35":
            return edad >= 26 && edad <= 35;
        case "36-45":
            return edad >= 36 && edad <= 45;
        case "46+":
            return edad >= 46;
        default:
            return true;
    }
}
