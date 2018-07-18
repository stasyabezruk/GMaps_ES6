import {GMarker} from "./GMarker";
import {getMaxZoom} from "./index";
import {getLoadIconEl} from "../onLoadSearch";

export class GMarkerCollection {
    constructor(gmap, data) {

        //Dependency injection (GMap)
        this.map = gmap.getMap();
        this.data = data;
        this.markers = [];
        this.markerCluster = null;

        this.initialize();
    }

    initialize(){
        this.setListMarkers(this.map, this.data);
    }

    setListMarkers(map, data){
        let gridSize = 40;

        if (map.getZoom() < 10) {
            gridSize = 30;
        }

        let jsonData = JSON.parse(data);

        const loadIcon = getLoadIconEl();
        loadIcon.hide();
        $j(".searchTitle .red").html(numberFormat("" + jsonData.count));
        $j(".adCount .number").html(jsonData.count);
        $j(".resultAmount").show();

        this.clearMarkers(jsonData.ads);

        if (jsonData.ads.length < 100) {
            gridSize = 20;
        }

        if (jsonData.ads.length === 0 && $j("#radius").val() !== "") {
            const center = new google.maps.LatLng($j("#latitude").val(), $j("#longitude").val());
            map.setCenter(center);
            window.updateMapBounds = false;
        }

        let bounds = new google.maps.LatLngBounds();
        for (let i = 0; i < jsonData.ads.length; i++) {
            const ad = jsonData.ads[i];
            const pos = new google.maps.LatLng(ad.latitude, ad.longitude);

            this.createMarker(pos, ad.id, "", map);
            if (window.updateMapBounds)
                bounds.extend(pos);
        }

        for (let i = 0; i < jsonData.similarAds.length; i++) {
            const ad = jsonData.similarAds[i];
            const pos = new google.maps.LatLng(ad.latitude, ad.longitude);

            if (ad.label !== "OLD") {

                this.createMarker(pos, ad.id, ad.label, map);

                if (window.updateMapBounds) {
                    bounds.extend(pos);
                }
            }

        }

        if (window.updateMapBounds) {
            map.fitBounds(bounds);
            window.updateMapBounds = false;
        }
        if (window.updateMapBounds) {
            const maxZoom = getMaxZoom();
            let zoom = map.getZoom();

            if (zoom > maxZoom)
                zoom = maxZoom;

            if (maxZoom > 12)
                $j("#mapResultsNoZoomBottom").hide();

            map.setOptions({zoom: zoom, maxZoom: maxZoom});
            google.maps.event.trigger(map, 'resize');
            window.updateMapZoom = false;
        }

        this.setClusters(gridSize, map);

    }

    createMarker(pos, adId, label, map) {
        for (let i = 0; i < this.markers.length; i++) {
            if (this.markers[i].adId === adId) {
                return;
            }
        }
        let marker = new GMarker(pos, adId, label, map);

        this.markers.push(marker);
    }

    setClusters(gridSize, map) {
        const clusterStyles = [
            {
                url: '/img/markers/marker2-map.png',
                width: 35,
                height: 35
            },
            {
                url: '/img/markers/marker3-map.png',
                width: 35,
                height: 35
            }
        ];

        this.markerCluster = new MarkerClusterer(map, this.markers, {
            styles: clusterStyles,
            gridSize: gridSize,
            maxZoom: getMaxZoom(),
            zoomOnClick: false
        });
        google.maps.event.addListener(this.markerCluster, 'mouseover', (cluster)=> {
            if (cluster.clusterIcon_.div_)
                cluster.clusterIcon_.div_.title = cluster.getSize() + ' annonser';
        });
        google.maps.event.addListener(this.markerCluster, 'clusterclick', (cluster) => {
            let ids = "";
            let similarIds = "";
            let oldIds = "";
            let clickedMarkers = cluster.getMarkers();

            for (let i = 0; i < clickedMarkers.length; i++) {
                if (clickedMarkers[i].adLabel === "SIMILAR")
                    similarIds = similarIds + clickedMarkers[i].adId + ",";
                else if (clickedMarkers[i].adLabel === "OLD")
                    oldIds = oldIds + clickedMarkers[i].adId + ",";
                else
                    ids = ids + clickedMarkers[i].adId + ",";
            }

            if (ids.length > 0) {
                ids = ids.substring(0, ids.length - 1);
            }

            if (similarIds.length > 0) {
                similarIds = similarIds.substring(0, similarIds.length - 1);
            }


            if (oldIds.length > 0) {
                oldIds = oldIds.substring(0, oldIds.length - 1);
            }

            $j.get('/component/search/map/ads.do?ids=' + ids + "&similarIds=" + similarIds + "&oldIds=" + oldIds, function(data) {
                $j("#adInfo").html(data);
                $j("#adInfo").show();
                if (window.innerWidth > 1029) {
                    $j("#adInfo").draggable({ containment: "window" });
                } else {
                    $j("#adInfo").dragg();
                }
            });

        });

        this.markerCluster.setCalculator(function (markers, numStyles) {
            if (map.getZoom() < 10) {
                return { text: "", index: 2 };
            }

            let index = 0;
            let count = markers.length;
            let total = count;

            while (total !== 0) {
                total = parseInt(total / 3, 10);
                index++;
            }

            index = Math.min(index, numStyles);
            return { text: "", index: index };
        });
    }

    clearMarkers(ads) {
        if (this.markerCluster) {
            this.markerCluster.setMap(null);
            this.markerCluster.clearMarkers();
        }

        let markersToRemove = [];

        for (let i = 0; i < this.markers.length; i++) {
            let found = false;
            let marker = this.markers[i];

            for (let j = 0; j < ads.length; j++) {
                if (marker.adId === ads[j].id) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                marker.setMap(null);
                markersToRemove.push(i);
            }
        }
        if (markersToRemove.length > 0) {
            for (let i = 0; i < markersToRemove.length; i++) {
                this.markers = this.markers.splice(markersToRemove[i], 1);
            }
        }
    }

    hideMarkers() {
        let i;
        for ( i = 0; i < this.markers.length; i++ ) {
            let marker = this.markers[i];
            marker.setVisible(false);
        }
        if (this.markerCluster) {
            this.markerCluster.clearMarkers();
        }

    }
}