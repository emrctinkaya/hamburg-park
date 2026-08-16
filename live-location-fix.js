// Keeps the map, GPS marker and accuracy radius synchronized with every geolocation update.
(() => {
  if (typeof handlePosition !== 'function') return;

  let accuracyCircle = null;
  let gpsStarting = false;
  const zoneCodes = matches => (matches || [])
    .map(f => code(f.properties?.bwp_code))
    .sort()
    .join('|');

  function updateGpsLayers(next) {
    if (!map) return;
    const latlng = [next.lat, next.lon];
    if (marker) marker.setLatLng(latlng);
    else marker = L.circleMarker(latlng,{radius:8,color:'#fff',weight:3,fillColor:'#ef4444',fillOpacity:1}).addTo(map);

    const radius = Math.max(1, Number(next.accuracy) || 1);
    if (accuracyCircle) {
      accuracyCircle.setLatLng(latlng);
      accuracyCircle.setRadius(radius);
    } else {
      accuracyCircle = L.circle(latlng,{radius,color:'#ef4444',weight:1,opacity:.45,fillColor:'#ef4444',fillOpacity:.08,interactive:false}).addTo(map);
      accuracyCircle.bringToBack();
    }
  }

  handlePosition = function(p, focus = false) {
    localStorage.setItem(K.loc, '1');
    const previous = last;
    const next = {
      lat:p.coords.latitude,
      lon:p.coords.longitude,
      accuracy:p.coords.accuracy,
      matches:features.filter(f=>contains(f,[p.coords.longitude,p.coords.latitude]))
    };
    const firstFix=!previous;
    const zoneChanged=firstFix||zoneCodes(previous.matches)!==zoneCodes(next.matches);
    last=next;

    if(firstFix||zoneChanged) render(last,focus||firstFix);
    updateGpsLayers(next);

    const accuracyEl=document.querySelector('.accuracy');
    if(accuracyEl) accuracyEl.textContent=`${t().accuracy} ±${Math.round(next.accuracy||0)} m`;

    requestAnimationFrame(()=>{
      const badge=document.querySelector('.accuracy');
      if(badge) badge.dispatchEvent(new Event('gpsaccuracychange'));
    });

    if(map){
      if(firstFix||focus) map.setView([next.lat,next.lon],Math.max(map.getZoom(),16),{animate:false});
      else map.panTo([next.lat,next.lon],{animate:true,duration:.25,easeLinearity:.5});
    }
    $('recenter').classList.add('show');
    $('locate').classList.add('hidden');
    $('live').classList.add('show');
  };

  function showGpsError(error) {
    gpsStarting = false;
    if (watchId != null) {
      try { navigator.geolocation.clearWatch(watchId); } catch (_) {}
      watchId = null;
    }
    $('live').classList.remove('show');
    $('locate').classList.remove('hidden');

    if (error?.code === 1) {
      localStorage.removeItem(K.loc);
      status(t().denied,'error');
      return;
    }

    // POSITION_UNAVAILABLE and TIMEOUT are recoverable: keep approval so a retry works immediately.
    status(t().error,'error');
  }

  stopWatch = function() {
    gpsStarting = false;
    if (watchId != null) {
      try { navigator.geolocation.clearWatch(watchId); } catch (_) {}
      watchId = null;
    }
    $('live').classList.remove('show');
  };

  startWatch = function() {
    if (gpsStarting || watchId != null || document.hidden) return;
    clearStatus();

    if (!navigator.geolocation || !window.isSecureContext) {
      $('locate').classList.remove('hidden');
      status(t().error,'error');
      return;
    }

    gpsStarting = true;

    // iOS Safari is more reliable when the first fix is requested explicitly before watchPosition.
    navigator.geolocation.getCurrentPosition(
      p => {
        gpsStarting = false;
        handlePosition(p, true);
        if (document.hidden) return;

        watchId = navigator.geolocation.watchPosition(
          next => handlePosition(next, false),
          error => {
            // A transient timeout while watching should not tear down a working location session.
            if (error?.code === 1) showGpsError(error);
          },
          {enableHighAccuracy:true,maximumAge:3000,timeout:20000}
        );
      },
      showGpsError,
      {enableHighAccuracy:true,maximumAge:0,timeout:15000}
    );
  };
})();
