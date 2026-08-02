// Keeps the map, GPS marker and accuracy radius synchronized with every geolocation update.
(() => {
  if (typeof handlePosition !== 'function') return;

  let accuracyCircle = null;
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

    // Re-run the lightweight UX accuracy state immediately after each GPS fix.
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
})();
