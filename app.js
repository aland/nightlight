const express = require('express')
const app = express()
const port = 3000

var SunCalc = require('suncalc');

app.get('/', (req, res) => {
  now = new Date();
  var sunPosition = SunCalc.getPosition(now, 37.4226711, -122.0849872)
  console.log(sunPosition);
  var moonPosition = SunCalc.getMoonPosition(now, 37.4226711, -122.0849872)
  console.log(moonPosition);
  let merged = {"sun": sunPosition, "moon": moonPosition};
  res.send(merged);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
