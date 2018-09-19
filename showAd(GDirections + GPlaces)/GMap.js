export class GMap {
    constructor(elId) {
        let dom = document.getElementById(elId);
        this.marker = null;
        this.map = null;

        this.initialize(dom);
        this.addEvents();
    }

    initialize(dom){
        let zoom,
            maxZoom;

        if (displayContacts) {
            zoom = 15;
            maxZoom = null;
        } else {
            zoom = 11;
            maxZoom = 12;
        }

        const options = {
            zoom: zoom,
            maxZoom: maxZoom,
            center: myLatlng,
            scrollwheel: false,
            zoomControl: true,
            streetViewControl: false,
            navigationControl: true,
            fullscreenControl: false,
            navigationControlOptions: {
                style: google.maps.NavigationControlStyle.SMALL,
                position: google.maps.ControlPosition.LEFT
            },
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            },
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL,
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
                {"featureType": "transit.station.bus", "stylers": [{ "visibility": "off" }]},
                {"featureType": "poi", "stylers": [{ "visibility": "off" }]}
            ]
        };

        this.map = new google.maps.Map(dom, options);
        this.addMarker();
    }

    addMarker() {
        let markerIcon;
        if (displayContacts) {
            markerIcon = '/img/markers/ad-marker.png';
        } else {
            markerIcon = '/img/markers/ad-marker2.png';
        }

        const marker = new google.maps.Marker({
            position: myLatlng,
            map: this.map,
            title: adTitle,
            icon: markerIcon
        });

        return marker;
    }

    maxMap() {
        $j("#maxMapButton").hide();
        $j("#minMapButton").show();
        $j(".mapBox").addClass("fullMap");
        $j("body").addClass("noScroll");

        const center = this.map.getCenter();
        google.maps.event.trigger(this.map, "resize");
        this.map.setCenter(center);

        $j(".directions-wrapper").show();
    }

    minMap() {
        $j("#minMapButton").hide();
        $j("#maxMapButton").show();
        $j(".mapBox").removeClass("fullMap");
        $j("body").removeClass("noScroll");

        const center = this.map.getCenter();
        google.maps.event.trigger(this.map, "resize");
        this.map.setCenter(center);

        $j(".directions-wrapper").hide();
    }

    addEvents() {
        google.maps.event.addListener(this.map, 'mousedown', ()=> {
            this.map.setOptions({ scrollwheel: true });
        });

        $j("#maxMapButton").on('click', ()=> {
            this.maxMap();
        });
        $j("#minMapButton").on('click', ()=> {
            this.minMap();
        });

        google.maps.event.addListener(this.map, 'zoom_changed', ()=> {

            if ( !displayContacts ) {
                const mapResultsNoZoom = $j('#noZoom');
                const currentZoom = this.map.getZoom();

                if (currentZoom === 12 && GMap.getMaxZoom() === 12) {
                    GMap.isInformPopUp();

                    mapResultsNoZoom.addClass('active');

                    setTimeout( ()=> {
                        mapResultsNoZoom.removeClass('active');
                    }, 4000);

                } else if (this.map.getZoom() < 12) {
                    mapResultsNoZoom.addClass('active');
                }
            }
        });
    }

    static getMaxZoom() {
        if(displayContacts) {
            return 21;
        } else {
            return 12;
        }
    }

    static isInformPopUp() {
        let popups = $j('.lightpopup'),
            i;
        for ( i =0; i < popups.length; i++ ){
            if ($j(popups[i]).hasClass('active')) {
                $j(popups[i]).removeClass('active');
            }
        }
    }

    getMap() {
        return this.map;
    }
}