// Keeps the map and GPS marker synchronized with every geolocation update.
(() => {
  if (typeof handlePosition !== 'function') return;

  const zoneCodes = matches => (matches || [])
    .map(f => code(f.properties?.bwp_code))
    .sort()
    .join('|');

  handlePosition = function(p, focus = false) {
    localStorage.setItem(K.loc, '1');

    const previous = last;
    const next = {
      lat: p.coords.latitude,
      lon: p.coords.longitude,
      accuracy: p.coords.accuracy,
      matches: features.filter(f => contains(f, [p.coords.longitude, p.coords.latitude]))
    };

    const firstFix = !previous;
    const zoneChanged = firstFix || zoneCodes(previous.matches) !== zoneCodes(next.matches);
    last = next;

    // Re-render zone-dependent UI only when needed. This avoids rebuilding all
    // GeoJSON layers on every small GPS update.
    if (firstFix || zoneChanged) {
      render(last, focus || firstFix);
    } else {
      // Move the existing GPS marker immediately for every watchPosition update.
      if (marker) {
        marker.setLatLng([next.lat, next.lon]);
      } else if (map) {
        marker = L.circleMarker([next.lat, next.lon], {
          radius: 8,
          color: '#fff',
          weight: 3,
          fillColor: '#ef4444',
          fillOpacity: 1
        }).addTo(map);
      }

      // Keep the accuracy indicator current without re-rendering the whole card.
      const accuracyEl = document.querySelector('.accuracy');
      if (accuracyEl) accuracyEl.textContent = `${t().accuracy} ±${Math.round(next.accuracy || 0)} m`;
    }

    // Follow the live location automatically. Preserve the user's current zoom
    // after the initial fix, but always keep the current GPS point centered.
    if (map) {
      if (firstFix || focus) {
        map.setView([next.lat, next.lon], Math.max(map.getZoom(), 16), { animate: false });
      } else {
        map.panTo([next.lat, next.lon], { animate: true, duration: 0.25, easeLinearity: 0.5 });
      }
    }

    $('recenter').classList.add('show');
    $('locate').classList.add('hidden');
    $('live').classList.add('show');
  };
})();
