// Run with node --watch app.js

const express = require('express')
const app = express()
const port = 3000
app.set('query parser', 'simple');

var SunCalc = require('suncalc');

app.get('/', (req, res) => {
  let time_ms;
  let now;
  if (typeof req.query.time_ms == "undefined") {
    time_ms = null;
    now = new Date();
  }
  else {
    time_ms = Number(req.query.time_ms);
    now = new Date(time_ms);
  }
  let lat = Number(req.query.lat ?? 0);
  let long = Number(req.query.long ?? 0);

  console.log({"time": time_ms, "Using": now.toString(), "lat": lat, "long": long});

  let sunPosition = SunCalc.getPosition(now, lat, long);
  //console.log({"Sun position" : sunPosition});
  var moonPosition = SunCalc.getMoonPosition(now, lat, long);
  //console.log({"Moon position": moonPosition});
  let moonIllumination = SunCalc.getMoonIllumination(now);
  //console.log({"Moon illumination": moonIllumination});
  let sunTimes = SunCalc.getTimes(now, lat, long);
  console.log({"Times": sunTimes});
  let nightlight;
  if (sunPosition.altitude > 0) {
    console.log({"Sun is above horizon": sunPosition.altitude});
    nightlight = 1;
  }
  else if (moonPosition.altitude > 0) {
    console.log({
      "Sun is below horizon": sunPosition.altitude,
      "moon is above horizon": moonPosition.altitude,
      "moon is illuminated": moonIllumination.fraction});
    nightlight = moonIllumination.fraction;
  }
  let merged = {"nightlight": nightlight, "sun": sunPosition, "moon": moonPosition};
  console.log({"Response" : merged});
  res.send(merged);
})

app.listen(port, () => {
  console.log(`Nightlight api listening on port ${port}`)
})
