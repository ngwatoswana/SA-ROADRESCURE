/* MOBILE MENU */

function toggleMenu(){

    const menu = document.getElementById("navLinks");

    menu.classList.toggle("active");

}


/* SHARE LOCATION */

function shareLocation(){

    if(navigator.geolocation){

        navigator.geolocation.getCurrentPosition(

        function(position){

            alert(
            "Location shared:\n\nLatitude: "
            + position.coords.latitude
            +
            "\nLongitude: "
            + position.coords.longitude
            );

        },

        function(){

            alert("Unable to access location.");

        }

        );

    }

    else{

        alert("Location is not supported.");

    }

}