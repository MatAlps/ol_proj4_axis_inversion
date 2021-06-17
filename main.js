import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import View from 'ol/View';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4';
import {transform} from 'ol/proj'
import {Stroke, Style} from 'ol/style';
import {Vector as VectorLayer} from 'ol/layer';
import {bbox as bboxStrategy} from 'ol/loadingstrategy';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';

//adding '+axis=neu' will fix the map but break the transformation
// proj4.defs("EPSG:3035","+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

//WKT epsg.io
proj4.defs("EPSG:3035", 'PROJCS["ETRS89 / LAEA Europe",GEOGCS["ETRS89",DATUM["European_Terrestrial_Reference_System_1989",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],TOWGS84[0,0,0,0,0,0,0],AUTHORITY["EPSG","6258"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4258"]],PROJECTION["Lambert_Azimuthal_Equal_Area"],PARAMETER["latitude_of_center",52],PARAMETER["longitude_of_center",10],PARAMETER["false_easting",4321000],PARAMETER["false_northing",3210000],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","3035"]]');

//WKT v1 epsg.org https://apps.epsg.org/api/v1/CoordRefSystem/3035/export/?format=wkt&formatVersion=1
// proj4.defs("EPSG:3035", 'PROJCS["ETRS89-extended / LAEA Europe",GEOGCS["ETRS89",DATUM["European Terrestrial Reference System 1989 ensemble",SPHEROID["GRS 1980",6378137,298.2572221,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","6258"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9102"]],AXIS["Lat",north],AXIS["Lon",east],AUTHORITY["EPSG","4258"]],PROJECTION["Lambert Azimuthal Equal Area",AUTHORITY["EPSG","19986"]],PARAMETER["Latitude of natural origin",52],PARAMETER["Longitude of natural origin",10],PARAMETER["False easting",4321000],PARAMETER["False northing",3210000],UNIT["meter",1,AUTHORITY["EPSG","9001"]],AXIS["Y",north],AXIS["X",east],AUTHORITY["EPSG","3035"]]');

register(proj4);

var vectorSource = new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
        return (
            'https://ahocevar.com/geoserver/wfs?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=osm:water_areas&' +
            'outputFormat=application/json&srsname=EPSG:3857&' +
            'bbox=' +
            extent.join(',') +
            ',EPSG:3857'
        );
    },
    strategy: bboxStrategy,
});

var vector = new VectorLayer({
    source: vectorSource,
    style: new Style({
        stroke: new Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 2,
        }),
    }),
});

var layers = [
    new TileLayer({
        source: new OSM(),
    }),
    new TileLayer({
            source: new TileWMS({
            url: 'https://wms.inspire.geoportail.lu/geoserver/hy/wms',
            params: {'LAYERS': 'HY.Network-BDLTC', 'TILED': true, 'VERSION' : '1.3.0'},
            serverType: 'geoserver',
            projection : 'EPSG:3035',
            // Countries have transparency, so do not fade tiles:
            transition: 0,
        }),
    }),
    vector];
var map = new Map({
    layers: layers,
    target: 'map',
    view: new View({
        center: [4039269.72, 2952487.51],
        zoom: 4,
        projection : 'EPSG:3035'
    }),
});

var transformedProj4 = proj4("EPSG:4326", "EPSG:3035", [5, 50]).map(x => Math.round(x));
var view = document.getElementById("coordinatesProj4");
view.innerHTML = JSON.stringify(transformedProj4);

var transformedOL = transform([5, 50], "EPSG:4326", "EPSG:3035", ).map(x => Math.round(x));
var view = document.getElementById("coordinatesOL");
view.innerHTML = JSON.stringify(transformedOL);
