import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import View from 'ol/View';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';

//adding '+axis=neu' will fix the map but break the transformation
proj4.defs("EPSG:3035","+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
register(proj4);

var layers = [
    new TileLayer({
        source: new OSM(),
    }),
    new TileLayer({
            source: new TileWMS({
            url: 'https://wms.inspire.geoportail.lu/geoserver/hy/wms',
            params: {'LAYERS': 'HY.Network-BDLTC', 'TILED': true},
            serverType: 'geoserver',
            projection : 'EPSG:3035',
            // Countries have transparency, so do not fade tiles:
            transition: 0,
        }),
    }) ];
var map = new Map({
    layers: layers,
    target: 'map',
    view: new View({
        center: [4039269.72, 2952487.51],
        zoom: 4,
        projection : 'EPSG:3035'
    }),
});

var transformed = proj4("EPSG:4326", "EPSG:3035", [5, 50]).map(x => Math.round(x));
var view = document.getElementById("coordinates");
view.innerHTML = JSON.stringify(transformed);
