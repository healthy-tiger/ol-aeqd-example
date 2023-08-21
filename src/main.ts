import './style.css'

import "ol/ol.css"

import Map from 'ol/Map';
import { Coordinate } from 'ol/coordinate';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import GeoJson from 'ol/format/GeoJSON';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { transform } from 'ol/proj';
import { Style, Fill, Stroke, Text } from 'ol/style';
import { FeatureLike } from 'ol/Feature';

const id_MYPROJ = 'MYPROJ';
const id_EPSG4326 = 'EPSG:4326';
const GRS80_LongRadius = 6378137;
const center: Coordinate = [139.691722, 35.689501];

// 長半径と短半径がどちらもGRS80の長半径と同じものとして投影する。
proj4.defs(id_MYPROJ, `+proj=aeqd +lat_0=${center[1].toFixed(3)} +lon_0=${center[0].toFixed(3)} +x_0=0 +y_0=0 +a=${GRS80_LongRadius} +b=${6378137} +datum=WGS84 +units=m +no_defs`)
register(proj4);

const lakesLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJson(),
    url: '/ne_50m_lakes.json',
  }),
  style: new Style({
    fill: new Fill({
      color: 'lightblue',
    }),
  }),
  minZoom: 5,
});

const rivers_lake_centerlines_Layer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJson(),
    url: '/ne_50m_rivers_lake_centerlines.json',
  }),
  style: new Style({
    stroke: new Stroke({
      color: 'lightblue',
      width: 1,
    }),
    fill: new Fill({
      color: 'lightblue',
    }),
  }),
  minZoom: 5,
});

const populated_places_Layer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJson(),
    url: '/ne_50m_populated_places.json',
  }),
  style: (f: FeatureLike, resolution:number):Style|undefined => {
    const p  = f.getProperties();
    const minzoom = Number.parseFloat(p['MIN_ZOOM']);
    if(!isNaN(minzoom)) {
      const z = map.getView().getZoomForResolution(resolution) ?? 0;
      if(z > minzoom) {
        return new Style({
          text: new Text({
            text:  p['NAME_JA'] ?? p['NAME'],        
          }),
        });
      }
    }
  },
});

const landLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJson(),
    url: '/ne_50m_land.json',
  }),
  style: new Style({
    fill: new Fill({
      color: '#eeeeee',
    }),
  }),
  background: 'lightblue',
  //updateWhileInteracting: true,
});

const map = new Map({
  target: 'map',
  view: new View({
    projection: id_MYPROJ,
    /*
      * 初期表示の中心位置の指定は、projectionで指定された投影法の座標系で与える必要がある。
      * 地理座標（緯度経度）を、測地系をEPSG:4326として、地理座標系から投影座標系（ここでは正距方位図法の座標系）に変換する。
      */
    center: transform(center, id_EPSG4326, id_MYPROJ),
    zoom: 5,
  }),
  layers: [landLayer, lakesLayer, rivers_lake_centerlines_Layer, populated_places_Layer],
});
