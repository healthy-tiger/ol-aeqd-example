import './style.css'

import "ol/ol.css"

import Map from 'ol/Map';
import { Coordinate } from 'ol/coordinate';
import View from 'ol/View';
import GeoJson from 'ol/format/GeoJSON';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { transform, get as getProjection } from 'ol/proj';
import { Style, Fill, Stroke, Text } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import { LayerInfo, load as loadLayers } from './layerloader';

const id_MYPROJ = 'MYPROJ';
const id_EPSG4326 = 'EPSG:4326';
const GRS80_LongRadius = 6378137;
const center: Coordinate = [139.691722, 35.689501]; //東京のあたり

// 長半径と短半径がどちらもGRS80の長半径と同じものとして投影する。
proj4.defs(id_MYPROJ, `+proj=aeqd +lat_0=${center[1].toFixed(3)} +lon_0=${center[0].toFixed(3)} +x_0=0 +y_0=0 +a=${GRS80_LongRadius} +b=${6378137} +datum=WGS84 +units=m +no_defs`)
register(proj4);


const layerinfos: LayerInfo[] = [
  {
    format: new GeoJson(),
    url: '/ne_50m_land.json',
    options: {
      style: new Style({
        fill: new Fill({
          color: '#eeeeee',
        }),
      }),
      background: 'lightblue',
      //updateWhileInteracting: true,
    },
  },
  {
    url: '/ne_50m_lakes.json',
    format: new GeoJson(),
    options: {
      style: new Style({
        fill: new Fill({
          color: 'lightblue',
        }),
      }),
      minZoom: 5,
    }
  },
  {
    url: '/ne_50m_rivers_lake_centerlines.json',
    format: new GeoJson(),
    options: {
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
    }
  },
  {
    url: '/ne_50m_populated_places.json',
    format: new GeoJson(),
    options: {
      style: (f: FeatureLike, resolution: number): Style | undefined => {
        const p = f.getProperties();
        const minzoom = Number.parseFloat(p['MIN_ZOOM']);
        if (!isNaN(minzoom)) {
          const z = map.getView().getZoomForResolution(resolution) ?? 0;
          if (z > minzoom) {
            return new Style({
              text: new Text({
                text: p['NAME_JA'] ?? p['NAME'],
              }),
            });
          }
        }
      },
      /*
      updateWhileInteracting: true,
      updateWhileAnimating: true,
      */
    }
  },
  {
    url: '/ne_50m_lakes.json',
    format: new GeoJson(),
    options: {
      style: new Style({
        fill: new Fill({
          color: 'lightblue',
        }),
      }),
      minZoom: 5,
    }
  }
];

const onlayerLoaded = (url: string) => {
  const d = document.createElement('div');
  d.innerText = `layer loaded: ${url}`;
  (document.querySelector('#log-list') as HTMLElement).appendChild(d);
}

(document.querySelector('#map') as HTMLElement).style.visibility = 'hidden';

loadLayers(layerinfos, getProjection(id_MYPROJ)!, onlayerLoaded).then((layers) => {
  layers.map((l) => {
    if (l) {
      map.addLayer(l);
    }
  });
  (document.querySelector('#log-list') as HTMLElement).remove();
  (document.querySelector('#map') as HTMLElement).style.visibility = 'visible';
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
});
