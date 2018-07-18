export class GMarker{
    constructor(latlng, adId, label, map){
        let icon = new google.maps.MarkerImage("/img/markers/marker-map.png", null, null, null, new google.maps.Size(35,35));
        if (label !== "") {
            icon = new google.maps.MarkerImage("/img/markers/marker-light.png", null, null, null, new google.maps.Size(30,30));
        }

        let marker = new google.maps.Marker({
            position: latlng,
            map: map,
            icon: icon,
            adId: adId,
            adLabel: label,
            zIndex: Math.round(latlng.lat() * -100000) << 5
        });

        this.addMarkerPopup(marker, adId, label);

        return marker;
        
    }

    addMarkerPopup(marker, adId, label) {
        google.maps.event.addListener(marker, 'click', function() {
            $j.get('/component/search/map/ad.do?adId=' + adId + "&label=" + label, function(data) {
                $j("#adInfo").html(data);
                $j("#adInfo").show();
                if (window.innerWidth > 1029) {
                    $j("#adInfo").draggable({ containment: "window" });
                } else {
                    $j("#adInfo").dragg();
                }
            });
        });
    }
}