import {MapTilerKey} from "../../shared/common/constants";

export class Map {
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
            container: dom, // container id
            style: `https://maps.tilehosting.com/styles/basic/style.json?key=${MapTilerKey}`,
            center: myLngLat,
            zoom: zoom,
            maxZoom: maxZoom
        };

        this.map = new mapboxgl.Map(options);

        const nav = new mapboxgl.NavigationControl();
        this.map.addControl(nav, 'bottom-right');

        this.map.addControl(new mapboxgl.FullscreenControl());

        this.addMarker();
    }

    addMarker() {
        let markerIcon;
        if (displayContacts) {
            markerIcon = '/img/markers/ad-marker.png';
        } else {
            markerIcon = '/img/markers/ad-marker2.png';
        }

        // create a DOM element for the marker
        let markerEl = document.createElement('div');
        markerEl.className = 'marker';
        markerEl.style.backgroundImage = `url(${markerIcon})`;
        markerEl.style.backgroundRepeat = "no-repeat";
        markerEl.style.width = '57px';
        markerEl.style.height = '40px';

        const marker = new mapboxgl.Marker(markerEl)
            .setLngLat(myLngLat)
            .addTo(this.map);
    }

    addEvents() {
        this.map.on('zoomstart', ()=> {

            if ( !displayContacts ) {
                const mapResultsNoZoom = $j('#noZoom');
                const currentZoom = this.map.getZoom();

                if (currentZoom === 12 && Map.getMaxZoom() === 12) {
                    Map.isInformPopUp();

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

    maxMap() {
        $j(".mapBox").addClass("fullMap");
        $j("body").addClass("noScroll");

        const center = this.map.getCenter();
        this.map.resize();
        this.map.setCenter(center);
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

}