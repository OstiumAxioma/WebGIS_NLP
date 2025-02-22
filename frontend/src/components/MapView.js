import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';

function MapView({ queryResult }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      // 初始化地图
      mapRef.current = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: [-8235650, 4970350], // 这是在EPSG:3857下的大约纽约位置
          zoom: 10,
        }),
      });
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // 每次查询结果改变，先清除之前的图层
    const oldLayers = mapRef.current.getLayers().getArray();
    const keepBaseLayer = oldLayers[0]; // 保留瓦片图层
    mapRef.current.setLayers([keepBaseLayer]);

    if (queryResult && queryResult.data && queryResult.data.length > 0) {
      // 创建VectorSource
      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(
          {
            type: 'FeatureCollection',
            features: queryResult.data.map((row) => ({
              type: 'Feature',
              geometry: row.geom, // row.geom 应该是一个GeoJSON对象
              properties: { ...row },
            })),
          },
          {
            featureProjection: 'EPSG:3857', // 假设我们地图用3857
          }
        ),
      });

      // 创建VectorLayer
      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({ color: 'red' }),
            stroke: new Stroke({ color: '#fff', width: 2 }),
          }),
        }),
      });

      mapRef.current.addLayer(vectorLayer);
    }
  }, [queryResult]);

  return <div id="map" style={{ width: '100%', height: '100%' }} />;
}

export default MapView;
