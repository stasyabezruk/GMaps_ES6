import {
    search,
    getMaxZoom
} from "../index";

export class GMap {
    constructor(elId) {
        let dom = document.getElementById(elId);
        this.scrollTimer = 0;

        this.initialize(dom);
        this.addEvents();
    }

    initialize(dom){
        const latitude = '61.907036';
        const longitude = '16.625633';
        let streetViewControl = false;

        // hasAccess defined on search.jsp
        if (hasAccess)
            streetViewControl = true;

        // if you change maxZoom check all places where we set it
        const maxZoom = getMaxZoom();

        const options = {
            zoom: 4,
            zoomControl: true,
            maxZoom: maxZoom,
            center: new google.maps.LatLng(latitude, longitude),
            mapTypeControl: true,
            scrollwheel: true,
            draggable: true,
            scaleControl: true,
            streetViewControl: streetViewControl,
            fullscreenControl: false,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_LEFT
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        this.map = new google.maps.Map(dom, options);
    }

    addEvents() {
        google.maps.event.addListener(this.map, 'click', ()=> {
            $j("#adInfo").hide();
        });
        google.maps.event.addListener(this.map, 'dragend', ()=> {
            this.searchTimer();
        });
        google.maps.event.addListener(this.map, 'zoom_changed', ()=> {

            if (!hasAccess && this.map.getZoom() == 12 && getMaxZoom() == 12) {
                let hideBuyAccessPopup = $j.cookie("hideBuyAccessPopup");

                window.setTimeout(function() {
                    if (!hideBuyAccessPopup)
                        $j("#mapResultsNoZoom").show();
                    $j("#mapResultsNoZoomBottom").show();
                }, 1000);

            } else if (this.map.getZoom() < 12) {
                $j("#mapResultsNoZoom").hide();
                $j("#mapResultsNoZoomBottom").hide();
            }

            if (window.searchByZoom)
                this.searchTimer();
        });
    }

    searchTimer() {
        clearTimeout(this.scrollTimer);
        
        this.scrollTimer = setTimeout( ()=> {
            this.processZoom();
        }, 700);
    }

    processZoom() {
        if (this.map.getZoom() > 10) {
            const bounds = this.map.getBounds();
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();

            $j("#minLatitude").val(sw.lat());
            $j("#maxLatitude").val(ne.lat());
            $j("#minLongitude").val(sw.lng());
            $j("#maxLongitude").val(ne.lng());
            window.setTimeout(search(), 100);

        } else {
            const oldLat = $j("#minLatitude").val();
            const oldLng = $j("#minLongitude").val();

            $j("#minLatitude").val("");
            $j("#maxLatitude").val("");
            $j("#minLongitude").val("");
            $j("#maxLongitude").val("");

            if (oldLat !== "" && oldLng !== null)
                window.setTimeout(search(), 100);
        }
    }

    getMap() {
        return this.map;
    }
}