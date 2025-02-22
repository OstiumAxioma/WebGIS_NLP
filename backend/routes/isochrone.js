// backend/routes/isochrone.js
const express = require('express');
const pgp = require('pg-promise')();
const router = express.Router();

// 修改为你的数据库IP和密码
const db = pgp({
  host: '192.168.31.138',
  port: 5432,
  database: 'nyc',
  user: 'postgres',
  password: '579098',
});

// 等时圈路由（保留）
router.post('/', async (req, res) => {
  const { center, time, selectedPOIs } = req.body;
  const { lng, lat } = center;

  try {
    // 查找离中心点最近的路网节点
    const nearestNodeQuery = `
      SELECT id
      FROM planet_osm_roads_vertices_pgr
      ORDER BY the_geom <-> ST_Transform(
        ST_SetSRID(ST_MakePoint($1, $2), 4326), ST_SRID(the_geom)
      )
      LIMIT 1;
    `;
    const nearestNode = await db.one(nearestNodeQuery, [lng, lat]);

    // 计算等时圈
    const isochroneQuery = `
      WITH isochrone AS (
        SELECT * FROM pgr_drivingDistance(
          'SELECT osm_id AS id, source, target, length_m::float8 AS cost FROM planet_osm_roads',
          $1::integer,
          $2::double precision * 60, -- 时间转换为秒
          false
        )
      )
      INSERT INTO isochrone_history (geom, created_at)
      VALUES (
        (SELECT ST_ConvexHull(ST_Collect(ST_Transform(r.way, 4326)))
         FROM isochrone AS i
         JOIN planet_osm_roads AS r ON i.edge = r.osm_id),
        NOW()
      )
      RETURNING ST_AsGeoJSON(geom) AS geom;
    `;
    const isochrone = await db.one(isochroneQuery, [nearestNode.id, time]);

    // 获取选定的POI（裁剪到最新的等时圈）
    const poiQueries = selectedPOIs.map(poiType => {
      return db.any(`
        SELECT ST_AsGeoJSON(wkb_geometry) AS geom
        FROM ${poiType}
        WHERE ST_Within(
          wkb_geometry,
          (SELECT geom
           FROM isochrone_history
           ORDER BY created_at DESC
           LIMIT 1)
        );
      `);
    });

    const poiResults = await Promise.all(poiQueries);

    res.json({
      isochrone: JSON.parse(isochrone.geom),
      pois: poiResults.flat().map(poi => JSON.parse(poi.geom)),
    });
  } catch (error) {
    console.error('错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;
