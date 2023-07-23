// Run with node app.js
// node --watch app.js just gets stuck in loop

const express = require('express')
const app = express()
const port = 3000

function* range(start, end, step=1) {
  while (start < end) {
    yield start;
    start += step;
  }
}

function logistic(x) {
  // Inspiration https://www.desmos.com/calculator/agxuc5gip8
  let a = 0.01;
  let k = 50;
  let b = Math.pow(Math.E, -k);
  return 1 / (1 + Math.pow(a * b, x));
}

function dateToISOLikeButLocal(date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const msLocal =  date.getTime() - offsetMs;
  const dateLocal = new Date(msLocal);
  const iso = dateLocal.toISOString();
  const isoLocal = iso.slice(0, 19);
  return isoLocal;
}

function rad2deg(rad) {
  return rad * (180/Math.PI);
}

// 'extended' is default and based on qs, 'simple' is based on node native querystring
// I think I only need simple..
app.set('query parser', 'simple');
// pretty print json
app.set('json spaces', 4)

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
  let nightlight = logistic(sunPosition.altitude);
  if (sunPosition.altitude > 0) {
    console.log({"Sun is above horizon": sunPosition.altitude});
  }
  else if (moonPosition.altitude > 0) {
    console.log({
      "Sun is below horizon": sunPosition.altitude,
      "moon is above horizon": moonPosition.altitude,
      "moon is illuminated": moonIllumination.fraction});
  }
  else {
    console.log('Both sun and moon are below horizon, it is probably dark');
  }
  let merged = {"nightlight": nightlight, "sun": sunPosition, "moon": moonPosition};
  console.log({"Response" : merged});
  res.send(merged);
})

app.get('/test', (req, res) => {
  function magic(x) {
    const magic = 31;
    return Math.min(Math.pow(Math.max(0, x + magic), 2) / 1000, 1);
  }
  /*
  function sigmoid(m, d, h, x) {
    return m*((0.5/(1/(1+(Math.pow(Math.E, -d)))-0.5))*((1/((1+(Math.pow(Math.E, -d*((1/h)*x-1))))))-0.5)+0.5);
  }
  */
  function sigmoid(x) {
    let m = 2;
    let d = 1;
    let h = 0.5;
    return m*((0.5/(1/(1+(Math.pow(Math.E, -d)))-0.5))*((1/((1+(Math.pow(Math.E, -d*((1/h)*x-1))))))-0.5)+0.5);
  }
  function arctan1(x) {
    let a = 1.6;
    let b = 0.4;
    let c = 1.2;
    return (a + (Math.atan(b*x))) / Math.pow(c, 2) + b;
  }
  function arctan2(x) {
    let a = 1.2;
    let b = 1.4;
    return b + (Math.atan(a*x));
  }
  function logistic(x) {
    // https://www.desmos.com/calculator/agxuc5gip8
    let k = 30;
    let b = Math.pow(Math.E, -k);
    return 1 / (1 + Math.pow(b, x));
  }
  /*
  for (const val of range(-10, 10)) {
    console.log(`${val}: ${logistic(val)}`);
  }
  */
  let ret = [];
  /*
  for(let i = -20; i < 20; i++) {
    //ret.push(`${i}, ${sigmoid(m, d, h, i)}`);
    ret.push(`${i}, ${arctan1(i)}`);
  }
  */
  const t = Math.PI / 2;
  let rad = -1 * t;
  let inc = t / 12;

  for (const val of range(rad, t, inc)) {
    console.log(`${val}: ${logistic(val)}`);
  }

  res.send(ret);
});

app.get('/today', (req, res) => {
  let today = new Date();

  const showDays = 2;
  let hours = showDays * 24;
  today.setHours(today.getHours() - hours);
  let lat = Number(req.query.lat ?? 0);
  let long = Number(req.query.long ?? 0);
  var merged = [];
  for (let i = 0; i <= hours; i++) {
    let sunPosition = SunCalc.getPosition(today, lat, long);
    let moonPosition = SunCalc.getMoonPosition(today, lat, long);
    let sunAltitudeDegrees = rad2deg(sunPosition.altitude);
    let moonAltitudeDegrees = rad2deg(moonPosition.altitude);
    let moonIllumination = SunCalc.getMoonIllumination(today);
    let nightlight= 0.0;
    /*
    if (sunAltitudeDegrees < -18) {
      console.log({"Sun is really below horizon": sunAltitudeDegrees});
    }
    else if (sunAltitudeDegrees < -12) {
      console.log({"Sun is kinda below horizon": sunAltitudeDegrees});
    }
    else if (sunAltitudeDegrees < -6) {
      console.log({"Sun is below horizon": sunAltitudeDegrees});
    }
    else if (sunAltitudeDegrees < 0) {
      console.log({"Sun is just below horizon": sunAltitudeDegrees});
    }
    else {
      console.log({"Sun is above horizon": sunAltitudeDegrees});
    }
    */
    nightlight = logistic(sunPosition.altitude);
    let totalNightlight = nightlight;

    if (moonPosition.altitude > 0) {
      /*
      console.log({
        "moon is above horizon": moonPosition.altitude,
        "moon is illuminated": moonIllumination.fraction});
      */
      totalNightlight = Math.min(1, nightlight + (moonIllumination.fraction / 10));
    }
    //console.log(`at ${dateToISOLikeButLocal(today)} sun was ${sunPosition.altitude} (${sunAltitudeDegrees} deg) calculated night light ${nightlight}`);
    console.log(`${dateToISOLikeButLocal(today)} ${sunPosition.altitude} ${sunAltitudeDegrees} ${nightlight} ${totalNightlight}`);
    merged.push({time: today.toString(), totalLight: totalNightlight, light: nightlight, sunAlt: sunAltitudeDegrees, moonAlt: moonAltitudeDegrees, moonIllum: moonIllumination.fraction});
    //today.setMinutes(minutes - 60);
    today.setHours(today.getHours() + 1);
  }
  //console.log({"Response" : merged});
  res.send(merged);
})

app.get('/recent', (req, res) => {
  let today = new Date();
  let hours = 6;
  today.setHours(today.getHours() - 1);
  let lat = Number(req.query.lat ?? 0);
  let long = Number(req.query.long ?? 0);
  var merged = [];
  for (let i = 0; i <= hours; i++) {

    let sunPosition = SunCalc.getPosition(today, lat, long);
    let moonPosition = SunCalc.getMoonPosition(today, lat, long);
    let sunAltitudeDegrees = rad2deg(sunPosition.altitude);
    let moonAltitudeDegrees = rad2deg(moonPosition.altitude);
    let moonIllumination = SunCalc.getMoonIllumination(today);
    let nightlight= 0.0;

    nightlight = logistic(sunPosition.altitude);
    let totalNightlight = nightlight;

    if (moonPosition.altitude > 0) {
      totalNightlight = Math.min(1, nightlight + (moonIllumination.fraction / 10));
    }
    console.log(`${dateToISOLikeButLocal(today)} ${sunPosition.altitude} ${sunAltitudeDegrees} ${nightlight} ${totalNightlight}`);
    merged.push({time: today.toString(), totalLight: totalNightlight, light: nightlight, sunAlt: sunAltitudeDegrees, moonAlt: moonAltitudeDegrees, moonIllum: moonIllumination.fraction});

    today.setHours(today.getHours() + 1);
  }
  res.send(merged);
})

app.listen(port, () => {
  console.log(`Nightlight api listening on port ${port}`)
})
