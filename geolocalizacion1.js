/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */
let map; // Mapa principal
let userCircle; // Círculo de búsqueda

// Inicializa el mapa con la ubicación del usuario
window.iniciarMap = function () {
    navigator.geolocation.getCurrentPosition(
        position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            map = new google.maps.Map(document.getElementById("map"), {
                center: { lat: userLat, lng: userLng },
                zoom: 14
            });

            // Solo dibuja el marcador de la ubicación inicial, no al buscar
            new google.maps.Marker({
                position: { lat: userLat, lng: userLng },
                map,
                title: "Tu ubicación inicial"
            });
        },
        error => {
            console.error("Error al obtener la ubicación del usuario.", error);
            alert("No se pudo obtener tu ubicación. Por favor, verifica los permisos.");
        }
    );
};

// Calcular distancia entre dos puntos geográficos usando Haversine
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Buscar por geolocalización y dibujar circunferencia
function buscarPorGeolocalizacion() {
    navigator.geolocation.getCurrentPosition(
        position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            const radio = parseFloat(document.getElementById("radio").value) * 1000; // Convertir km a metros

            const solicitud = indexedDB.open("vitomaite04", 1);

            solicitud.onsuccess = function (evento) {
                bd = evento.target.result;

                const transaccion = bd.transaction(["usuario"], "readonly");
                const almacen = transaccion.objectStore("usuario");

                const solicitudUsuarios = almacen.getAll();
                solicitudUsuarios.onsuccess = function (evento) {
                    const usuarios = evento.target.result;

                    if (!usuarios || usuarios.length === 0) {
                        alert("No se encontraron usuarios dentro del radio especificado.");
                        return;
                    }

                    // Eliminar el círculo anterior si existe
                    if (userCircle) {
                        userCircle.setMap(null);
                    }

                    // Dibujar la circunferencia en el mapa
                    userCircle = new google.maps.Circle({
                        strokeColor: "#FF0000",
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: "#FF0000",
                        fillOpacity: 0.2,
                        map,
                        center: { lat: userLat, lng: userLng },
                        radius: radio // Radio en metros
                    });

                    // Centrar el mapa en la ubicación del usuario
                    map.setCenter({ lat: userLat, lng: userLng });

                    // Agregar marcadores para los usuarios dentro del radio
                    usuarios.forEach(usuario => {
                        if (usuario.latitud && usuario.longitud) {
                            const distancia = calcularDistancia(
                                userLat, userLng, usuario.latitud, usuario.longitud
                            );

                            if (distancia <= radio / 1000) { // Convertir metros a kilómetros para la comparación
                                const marcador = new google.maps.Marker({
                                    position: { lat: usuario.latitud, lng: usuario.longitud },
                                    map,
                                    title: usuario.nombre
                                });

                                const infoWindow = new google.maps.InfoWindow({
                                    content: `<div><strong>${usuario.nombre}</strong><br>
                                              Edad: ${usuario.edad} años</div>`
                                });

                                marcador.addListener("click", () => {
                                    infoWindow.open(map, marcador);
                                });
                            }
                        } else {
                            console.warn(`Usuario ${usuario.nombre} no tiene coordenadas válidas.`);
                        }
                    });
                };

                solicitudUsuarios.onerror = function () {
                    console.error("Error al obtener los usuarios de la base de datos.");
                };
            };

            solicitud.onerror = function () {
                console.error("Error al abrir la base de datos.");
            };
        },
        error => {
            console.error("Error al obtener la ubicación del usuario.", error);
            alert("No se pudo obtener tu ubicación. Por favor, verifica los permisos.");
        }
    );
}


