/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


function handleSearchClick() {
    // Redireccionar a la página que deseas (por ejemplo, resultados.html)
    if (!bd) {
        alert("La base de datos aún no está inicializada. Intenta de nuevo.");
        return;
    }
     const queBuscas = document.getElementById('queBuscas').value;
    const edad = document.getElementById('edad').value;
    const ciudad = document.getElementById('ciudad').value;
    
    sessionStorage.setItem("busquedaCiudad", ciudad);
    sessionStorage.setItem("busquedaGenero", queBuscas);
    sessionStorage.setItem("busquedaEdad", edad);

    // Verificar si todos los campos están completados
    if (queBuscas === "" || edad === "" || ciudad === "") {
        alert("Por favor, completa todos los campos del formulario.");
        return; // Salir de la función si hay algún campo vacío
    }
    window.location.href = "busqueda-no-log.html";
}

function handleSearchClick2() {
    // Redireccionar a la página que deseas (por ejemplo, resultados.html)
    if (!bd) {
        alert("La base de datos aún no está inicializada. Intenta de nuevo.");
        return;
    }
    const queBuscas = document.getElementById('queBuscas').value;
    const edad = document.getElementById('edad').value;
    const ciudad = document.getElementById('ciudad').value;
    
    sessionStorage.setItem("busquedaCiudad", ciudad);
    sessionStorage.setItem("busquedaGenero", queBuscas);
    sessionStorage.setItem("busquedaEdad", edad);

    // Verificar si todos los campos están completados
    if (queBuscas === "" || edad === "" || ciudad === "") {
        alert("Por favor, completa todos los campos del formulario.");
        return; // Salir de la función si hay algún campo vacío
    }
    window.location.href = "busquedaLog.html";
}


function logout() {
    // Borra todos los datos del sessionStorage
    sessionStorage.clear();
}

