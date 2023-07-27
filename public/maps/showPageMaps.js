mapboxgl.accessToken = token;
const geometry = campInfo.geometry;
const map = new mapboxgl.Map({
  container: "map", // container ID
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/mapbox/navigation-day-v1", // style URL
  center: geometry.coordinates, // starting position [lng, lat]
  zoom: 8, // starting zoom
});

const controls = new mapboxgl.NavigationControl();
map.addControl(controls, `top-right`);

const marker = new mapboxgl.Marker()
  .setLngLat(geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4>${campInfo.title}</h4>`)
  )
  .addTo(map);
