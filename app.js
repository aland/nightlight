const express = require('express')
const app = express()
const port = 3000

var SunCalc = require('suncalc');

app.get('/', (req, res) => {
  let time_ms = req.query.time_ms ?? 0;
  now = new Date(time_ms);
  let lat = req.query.lat ?? 0;
  let long = req.query.long ?? 0;
  var sunPosition = SunCalc.getPosition(now, lat, long)
  console.log(sunPosition);
  var moonPosition = SunCalc.getMoonPosition(now, lat, long)
  console.log(moonPosition);
  let merged = {"sun": sunPosition, "moon": moonPosition};
  res.send(merged);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
