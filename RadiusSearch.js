import {search} from "../index";

export class RadiusSearch {
    constructor(el) {
        this.el = $j(el);
        this.init();
    }

    init() {
        if (this.el.hasClass("active")) {
            $j("#radiusSearch").removeClass("active");
            $j("#selectedCriterias .group.municipalities").removeClass("disabled");
            $j("#radius").val('');

            window.curPosMarker.setMap(null);
            window.updateMapBounds = false;
            search();
        } else {
            $j("#radiusSearch").addClass("active");
            $j("#selectedCriterias .group.municipalities").addClass("disabled");

            setTimeout(()=> {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(this.getPosition, RadiusSearch.errorCallback);
                } else {
                    RadiusSearch.errorCallback();
                }
            }, 2000);
        }
    }

    static errorCallback() {
        $j("#radiusSearch").removeClass("active");
        $j("#selectedCriterias .group.municipalities").removeClass("disabled");
        alert("Cannot get location. Check your settings.");
    }

    getPosition(position) {
        const map = window.map.getMap();
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        $j("#latitude").val(lat);
        $j("#longitude").val(lon);
        $j("#radius").val('3');

        window.updateMapBounds = true;
        window.searchByZoom = false;

        const center = new google.maps.LatLng(lat, lon);
        map.setCenter(center);

        const image = {
            url: '/img/markers/person.png',
            scaledSize: new google.maps.Size(40, 40), // scaled size
            origin: new google.maps.Point(0,0), // origin
            anchor: new google.maps.Point(0, 0) // anchor
        };

       window.curPosMarker = new google.maps.Marker({
            position: {lat: lat, lng: lon},
            map: map,
            icon: image,
            title: 'Du är här',
        });
        search();
    }

}