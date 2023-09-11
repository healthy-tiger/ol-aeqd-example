import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import JSONFeature from 'ol/format/JSONFeature';
import { ProjectionLike } from 'ol/proj';

export interface LayerInfo {
    url: string,
    format: JSONFeature,
    options?: any,
}

const _load = (info: LayerInfo,
    projection: ProjectionLike,
    onload?: (url: string) => void,
    onerror?: (url: string, reason: any) => void) => {
    const url = info.url;
    return fetch(url).then((res) => {
        return res.json();
    }, (err) => {
        if (onerror) {
            onerror(url, err);
        }
    }).then((src) => {
        const layer = new VectorLayer({
            ...info.options,
            source: new VectorSource({
                format: info.format,
                features: info.format.readFeatures(src, {
                    featureProjection: projection,
                }),
            }),
        });
        if (onload) {
            onload(url);
        }
        return layer;
    }, (err) => {
        if (onerror) {
            onerror(url, err);
        }
    });
}

export const load = (infos: LayerInfo[],
    projection: ProjectionLike,
    onload?: (url: string) => void,
    onerror?: (url: string, reason: any) => void) => {
    return Promise.all(infos.map((i: LayerInfo) => {
        return _load(i, projection, onload, onerror);
    }));
}