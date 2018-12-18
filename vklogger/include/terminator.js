Ephemeris = function(){}

Ephemeris.prototype.JulianDay = function(date){
  d = new Date();
  d.setTime(date.getTime())
  var year=d.getUTCFullYear();
  var month=d.getUTCMonth()+1;
  var day=d.getUTCDate();
  var calender="";

  if(month <= 2){
    var year = year - 1;
    var month = month + 12;
  } 

  var julian_day = Math.floor(365.25*(year+4716))+Math.floor(30.6001*(month+1))+day-1524.5;
  
  if (calender == "julian"){ 
    var transition_offset=0;
  }else if(calender == "gregorian"){
    var tmp = Math.floor(year/100);
    var transition_offset=2-tmp+Math.floor(tmp/4);
  }else if(julian_day<2299160.5){
    var transition_offset=0;
  }else{
    var tmp = Math.floor(year/100);
    var transition_offset=2-tmp+Math.floor(tmp/4);
  }
    var jd=julian_day+transition_offset;
    this.jd = jd;
    return jd
}


Ephemeris.prototype.GMST = function(date){
//load default values
  d = new Date();
  d.setTime(date.getTime())
  var hours=d.getUTCHours();
  var minutes=d.getUTCMinutes();
  var seconds=d.getUTCSeconds();
  var time_in_sec=hours*3600+minutes*60+seconds;
  var ephemeris = new Ephemeris()
  var jd = ephemeris.JulianDay(date);
  var rad=Math.PI/180;
  var deg=180/Math.PI;
  
//gmst at 0:00
  var t = (jd-2451545.0)/36525;
  var gmst_at_zero = (24110.5484 + 8640184.812866*t+0.093104*t*t+0.0000062*t*t*t)/3600;
  if(gmst_at_zero>24){gmst_at_zero=gmst_at_zero%24;}
  this.gmst_at_zero=gmst_at_zero;

//gmst at target time

  var gmst=gmst_at_zero+(time_in_sec * 1.00273790925)/3600;
/*
  //mean obliquity of the ecliptic
  e = 23+26.0/60+21.448/3600 -46.8150/3600*t -0.00059/3600*t*t +0.001813/3600*t*t*t;
  //nutation in longitude
  omega = 125.04452-1934.136261*t+0.0020708*t*t+t*t*t/450000;
  long1 = 280.4665 + 36000.7698*t;
  long2 = 218.3165 + 481267.8813*t;
  phai = -17.20*Math.sin(omega*rad)-(-1.32*Math.sin(2*long1*rad))-0.23*Math.sin(2*long2*rad) + 0.21*Math.sin(2*omega*rad);
  gmst =gmst + ((phai/15)*(Math.cos(e*rad)))/3600
*/
  if(gmst<0){gmst=gmst%24+24;}
  if(gmst>24){gmst=gmst%24;}
  this.gmst=gmst
  return gmst
}


Ephemeris.prototype.Sun = function(date){
  //load default values
  d = new Date();
  d.setTime(date.getTime())
  var year=d.getUTCFullYear();
  var hours=d.getUTCHours();
  var minutes=d.getUTCMinutes();
  var seconds=d.getUTCSeconds();
  var time_in_day=hours/24+minutes/1440+seconds/86400;
  
  var ephemeris = new Ephemeris()
  var jd = ephemeris.JulianDay(date);
  var rad=Math.PI/180;
  var deg=180/Math.PI;

  //ephemeris days from the epch J2000.0
  var t = (jd + time_in_day -2451545.0)/36525;
  //for test jd = 2448908.5
  //var t = (2448908.5 -2451545.0)/36525;// + time_in_day;

  //geometric_mean_longitude
  var mean_longitude = 280.46646 + 36000.76938*t + 0.0003032*t*t;
   if(mean_longitude<0){mean_longitude=mean_longitude%360+360;}
   if(mean_longitude>360){mean_longitude=mean_longitude%360;}

  //mean anomaly of the Sun
  var mean_anomaly =  357.52911+ 35999.05029*t + 0.0001537*t*t;
   if(mean_anomaly<0){mean_anomaly=mean_anomaly%360+360;}
   if(mean_anomaly>360){mean_anomaly=mean_anomaly%360;}

  //eccentricity of the Earth's orbit
  var eccentricity = 0.01678634 + 0.000042037*t + 0.0000001267*t*t;
  //Sun's equation of  the center
  c = (1.914602 - 0.004817*t + 0.000014*t*t)*Math.sin(mean_anomaly*rad);
  c =c+ (0.019993 - 0.000101*t)*Math.sin(2*mean_anomaly*rad);
  c =c+ 0.000289 *Math.sin(3*mean_anomaly*rad);
  //true longitude of the Sun
  var true_longitude = mean_longitude + c;
  //for more accuracy
  //true_longitude = true_longitude - 0.01397*(year - 2000);  
  //true anomary of the Sun
  var true_anomary = mean_anomaly + c;
  //radius vector, distance between center of the Sun and the Earth
  var radius = (1.000001018*(1-eccentricity*eccentricity))/(1 + eccentricity*Math.cos(true_anomary*rad));
  this.radius=radius;
  //apparent longitude
  w = 125.04 - 1934.136*t;
  apparent_longitude = true_longitude - 0.00569 - 0.00478 * Math.sin(w*rad);
  //obliquity of the ecliptio
  obliquity = 23+26.0/60+21.448/3600 -46.8150/3600*t -0.00059/3600*t*t +0.001813/3600*t*t*t; 
  //correction for apperent position of the sun 
  obliquity = obliquity+0.00256*Math.cos(w*rad);
  //right asantion of the Sun
  var ra = Math.atan2(Math.cos(obliquity*rad)*Math.sin(apparent_longitude*rad), Math.cos(apparent_longitude*rad))
  ra = ra *deg;
 if(ra<0){ra=ra+360;}
 if(ra>360){ra=ra%360;}
  this.ra=ra/15;
 //declination of the Sun
 var dec = Math.asin(Math.sin(obliquity*rad)*Math.sin(apparent_longitude*rad));
 this.dec=dec * deg;
 return this;
}


Terminator=function(date){
 this.date = date;
}

Terminator.prototype.generate = function(){
  date = this.date;
  var rad=Math.PI/180;
  var ephem = new Ephemeris();
  var sun = ephem.Sun(date);
  var sun_ra = sun.ra;
  var sun_dec = sun.dec;
  var gmst = ephem.GMST(date);
  //var longitude = longitude*-1;
  var sun_long = -(gmst*15 - sun_ra*15);
  if (sun_long>360){sun_long=sun_long%360};
  if (sun_long<0){sun_long=sun_long%360+360};
  var sun_lat = sun_dec;
  if(sun_lat>5){
    var polar_night_flag = "south";
  }else if(sun_lat<-5){
    var polar_night_flag = "north";    
  }else{
    var polar_night_flag = "none";
  }
  //document.getElementById('num').innerHTML = sun_long +  " | " + sun_lat +"<br>";

  var latitude_array1 = [];
  var latitude_array2 = [];
  var latitude_array3 = [];
  var latitude_array4 = [];
  var longitude_array1 = [];
  var longitude_array2 = [];
  var longitude_array3 = [];
  var longitude_array4 = [];
  var step = 1;
  for (i=90; i>= 0; i-=step){
    var delta_array = new Array();
    var delta_lat = Math.asin(Math.cos(sun_lat*rad)*Math.sin(i*rad))/rad;
    if(Math.abs(delta_lat)<85){
      var x = -Math.cos(sun_long*rad)*Math.sin(sun_lat*rad)*Math.sin(i*rad)-Math.sin(sun_long*rad)*Math.cos(i*rad);
      var y = -Math.sin(sun_long*rad)*Math.sin(sun_lat*rad)*Math.sin(i*rad)+Math.cos(sun_long*rad)*Math.cos(i*rad);
      var delta_long = Math.atan2(y,x)/rad;
      if(delta_long>360){delta_long=delta_long%360}
      if(delta_long<0){delta_long=delta_long%360+360}
      latitude_array1.push(delta_lat);
      longitude_array1.push(delta_long);
    }
  }
  for (i=360; i>= 270; i-=step){
    var delta_array = new Array();
    var delta_lat = Math.asin(Math.cos(sun_lat*rad)*Math.sin(i*rad))/rad;
    if(Math.abs(delta_lat)<85){
      var x = -Math.cos(sun_long*rad)*Math.sin(sun_lat*rad)*Math.sin(i*rad)-Math.sin(sun_long*rad)*Math.cos(i*rad);
      var y = -Math.sin(sun_long*rad)*Math.sin(sun_lat*rad)*Math.sin(i*rad)+Math.cos(sun_long*rad)*Math.cos(i*rad);
      var delta_long = Math.atan2(y,x)/rad
      if(delta_long>360){delta_long=delta_long%360}
      if(delta_long<0){delta_long=delta_long%360+360}
      latitude_array2.push(delta_lat);
      longitude_array2.push(delta_long);
    }
  }
  for (i=90; i<= 180;i+=step){
    var delta_array = new Array();
    var delta_lat = Math.asin(Math.cos(sun_lat*rad)*Math.sin(i*rad))/rad;
    if(Math.abs(delta_lat)<85){
      var x = -Math.cos(sun_long*rad)*Math.sin(sun_lat*rad)*Math.sin(i*rad)-Math.sin(sun_long*rad)*Math.cos(i*rad);
      var y = -Math.sin(sun_long*rad)*Math.sin(sun_lat*rad)*Math.sin(i*rad)+Math.cos(sun_long*rad)*Math.cos(i*rad);
      var delta_long = Math.atan2(y,x)/rad;
      if(delta_long>360){delta_long=delta_long%360}
      if(delta_long<0){delta_long=delta_long%360+360}
      latitude_array3.push(delta_lat);
      longitude_array3.push(delta_long);
    }
 }
  for (i=180; i<=270; i+=step){
    var delta_array = new Array();
    var delta_lat = Math.asin(Math.cos(sun_lat*rad)*Math.sin(i*rad))/rad;
     if(Math.abs(delta_lat)<85){
     var x = -Math.cos(sun_long*rad)*Math.sin(sun_lat*rad)*Math.sin(i*rad)-Math.sin(sun_long*rad)*Math.cos(i*rad);
      var y = -Math.sin(sun_long*rad)*Math.sin(sun_lat*rad)*Math.sin(i*rad)+Math.cos(sun_long*rad)*Math.cos(i*rad);
      var delta_long = Math.atan2(y,x)/rad;
      if(delta_long>360){delta_long=delta_long%360}
      if(delta_long<0){delta_long=delta_long%360+360}
      latitude_array4.push(delta_lat);
      longitude_array4.push(delta_long);
    }
  }

  this.sun_long = sun_long;
  this.sun_lat = sun_lat;  
  this.polar_night_flag = polar_night_flag;  
  if(sun_lat < 0){
    latitude_array4.reverse();
    latitude_array3.reverse();
    longitude_array4.reverse();
    longitude_array3.reverse();
    var latitude_array_west = latitude_array4.concat(latitude_array3);
    var longitude_array_west = longitude_array4.concat(longitude_array3);
    var latitude_array_east = latitude_array1.concat(latitude_array2);
    var longitude_array_east = longitude_array1.concat(longitude_array2);
  }else if(sun_lat > 0){
    var latitude_array_west = latitude_array3.concat(latitude_array4);
    var longitude_array_west = longitude_array3.concat(longitude_array4);
    latitude_array1.reverse();
    latitude_array2.reverse();
    longitude_array1.reverse();
    longitude_array2.reverse();
    var latitude_array_east = latitude_array2.concat(latitude_array1);
    var longitude_array_east = longitude_array2.concat(longitude_array1);
  }
  var night_latitude_array=latitude_array_east.concat(latitude_array_west);
  var night_longitude_array=longitude_array_east.concat(longitude_array_west);
  this.night_latitude_array=night_latitude_array;
  this.night_longitude_array=night_longitude_array;
  return this;
}


Terminator.prototype.show = function(map,boundary,night_shade){
  var terminator =this.generate();
//Search Split Point
  var night_longitude_array = terminator.night_longitude_array;
  var night_latitude_array = terminator.night_latitude_array;
  var polar_night_flag = terminator.polar_night_flag;  
  
  var t0=0, t1=0, t2=0, t3=0;t4=0; t5=0;
  var night_longitude_array_length=night_longitude_array.length;
  for (i = 0; i < night_longitude_array_length; i++) {  
    if(night_longitude_array[0]<night_longitude_array[i]){t0++}
    if(night_longitude_array[i]>0 &&night_longitude_array[i]<90){t1++}
    if(night_longitude_array[i]>90 &&night_longitude_array[i]<180){t2++}
    if(night_longitude_array[i]>180 &&night_longitude_array[i]<270){t3++}
    if(night_longitude_array[i]>270){t4++}  
  }

  if (night_longitude_array[0]>0 && night_longitude_array[0]<90){
    var night_id1 = t0-(t2+t3+t4)+1;
    var night_id2 = night_id1+t2;
    var night_id3 = night_id2+t3;
    var night_id4 = night_id3+t4;
    start_point="0to90";
  }else if(night_longitude_array[0]>90 && night_longitude_array[0]<180){
    if (night_longitude_array[night_longitude_array_length-1] >90 && night_longitude_array[night_longitude_array_length-1] <180){
    var night_id1 = t0-(t3+t4)+1;
}else{
    var night_id1 = t2;
    }
    var night_id2 = night_id1+t3;
    var night_id3 = night_id2+t4;
    var night_id4 = night_id3+t1;
    start_point="90to180";
  }else if(night_longitude_array[0]>180 && night_longitude_array[0]<270){
    if (night_longitude_array[night_longitude_array_length-1] >180 && night_longitude_array[night_longitude_array_length-1]<270){
      var night_id1 = t0-(t4)+1;
    }else{
    var night_id1 = t3;
    }
    var night_id2 = night_id1+t4;
    var night_id3 = night_id2+t1;
    var night_id4 = night_id3+t2;
    start_point="180to270";
  }else{
    var night_id1 = t0+1;
    var night_id2 = night_id1+t1;
    var night_id3 = night_id2+t2;
    var night_id4 = night_id3+t3;
    start_point="270to360";
  }
  this.t0 = t0;
  this.t1 = t1;
  this.t2 = t2;
  this.t3 = t3;
  this.t4 = t4;
  
//Split Night Longitude/Latitude Arrays
  var night_longitude_array1 = night_longitude_array.slice(0 , night_id1);
  var night_latitude_array1 = night_latitude_array.slice(0 , night_id1);

  var night_longitude_array2 = night_longitude_array.slice(night_id1,night_id2);
  var night_latitude_array2 = night_latitude_array.slice(night_id1,night_id2);
  
  var night_longitude_array3 = night_longitude_array.slice(night_id2,night_id3);
  var night_latitude_array3 = night_latitude_array.slice(night_id2,night_id3);

  var night_longitude_array4 = night_longitude_array.slice(night_id3,night_id4);
  var night_latitude_array4 = night_latitude_array.slice(night_id3,night_id4);

  var night_longitude_array5 = night_longitude_array.slice(night_id4);
  var night_latitude_array5 = night_latitude_array.slice(night_id4);



//Function for split on the Greenwich meridian
  var split_meridian = function(point1,point2){
    var  split_lat = night_latitude_array[point1] + (360-night_longitude_array[point1])*((night_latitude_array[point2] - night_latitude_array[point1])/(night_longitude_array[point2]+360 - night_longitude_array[point1]));
    return split_lat;
  }

//Function for split on the International Date Line
  var split_other = function(point1,point2,seed){
    var  split_lat = night_latitude_array[point1] + (seed- night_longitude_array[point1])*((night_latitude_array[point2] - night_latitude_array[point1])/((night_longitude_array[point2] - night_longitude_array[point1])));
    return split_lat;
  }


  if (start_point == "0to90"){
   night_longitude_array1.push(90);
   split_latitude1 = split_other(night_id1-1,night_id1,90)
  }else if(start_point == "90to180"){
    night_longitude_array1.push(180);
   split_latitude1 = split_other(night_id1-1,night_id1,180)
  }else if(start_point == "180to270"){
    night_longitude_array1.push(270);
   split_latitude1 = split_other(night_id1-1,night_id1,270)
  }else if(start_point == "270to360"){
    night_longitude_array1.push(0);
    split_latitude1 = split_meridian(night_id1-1,night_id1);
  }
    night_latitude_array1.push(split_latitude1);

    night_latitude_array2.unshift(split_latitude1);
    if (start_point == "0to90"){
      night_longitude_array2.unshift(90);
    }else if(start_point == "90to180"){
      night_longitude_array2.unshift(-180);
    }else if(start_point == "180to270"){
      night_longitude_array2.unshift(270);
    }else if(start_point == "270to360"){
      night_longitude_array2.unshift(0);
    }

  if (night_latitude_array3.length>0){
    if (start_point == "0to90"){
      night_longitude_array2.push(180);
      split_latitude2 = split_other(night_id2-1,night_id2,180)
      night_longitude_array3.unshift(-180);
    }else if(start_point == "90to180"){
      night_longitude_array2.push(270);
      split_latitude2 = split_other(night_id2-1,night_id2,270)
      night_longitude_array3.unshift(270);
    }else if(start_point == "180to270"){
      night_longitude_array2.push(360);
      split_latitude2 = split_meridian(night_id2-1,night_id2);
      night_longitude_array3.unshift(0);
    }else if(start_point == "270to360"){
      night_longitude_array2.push(90);
      split_latitude2 = split_other(night_id2-1,night_id2,90);
      night_longitude_array3.unshift(90);
    }
    night_latitude_array2.push(split_latitude2);
    night_latitude_array3.unshift(split_latitude2);
  }

  if (night_latitude_array4.length>0){
    if (start_point == "0to90"){
      night_longitude_array3.push(270);
      split_latitude3 = split_other(night_id3-1,night_id3,270)
      night_longitude_array4.unshift(270);
    }else if(start_point == "90to180"){
      night_longitude_array3.push(360);
      split_latitude3 = split_meridian(night_id3-1,night_id3)
      night_longitude_array4.unshift(0);
    }else if(start_point == "180to270"){
      night_longitude_array3.push(90);
      split_latitude3 = split_other(night_id3-1,night_id3,90);
      night_longitude_array4.unshift(90);
    }else if(start_point == "270to360"){
      night_longitude_array3.push(180);
      split_latitude3 = split_other(night_id3-1,night_id3,180);
      night_longitude_array4.unshift(-180);
    }
    night_latitude_array3.push(split_latitude3);
    night_latitude_array4.unshift(split_latitude3);
  }

  if (night_latitude_array5.length>1){
    if (start_point == "0to90"){
    night_longitude_array4.push(360);
    split_latitude4 = split_meridian(night_id4,night_id4+1)
    }else if(start_point == "90to180"){
    night_longitude_array4.push(90);
    split_latitude4 = split_other(night_id4,night_id4+1,90)
    }else if(start_point == "180to270"){
    night_longitude_array4.push(180);
    split_latitude4 = split_other(night_id4,night_id4+1,180)
    }else if(start_point == "270to360"){
    night_longitude_array4.push(270);
    split_latitude4 = split_other(night_id4,night_id4+1,270);
    }
    night_latitude_array4.push(split_latitude4);

    night_latitude_array5.unshift(split_latitude4);
    if (start_point == "0to90"){
      night_longitude_array5.unshift(0);
    }else if(start_point == "90to180"){
      night_longitude_array5.unshift(90);
    }else if(start_point == "180to270"){
      night_longitude_array5.unshift(-180);
    }else if(start_point == "270to360"){
      night_longitude_array5.unshift(270);
    }
  }


//Generate Porygon Array
  night_polyline_array1= [];
  night_polyline_array2= [];
  night_polyline_array3= [];
  night_polyline_array4= [];
  night_polyline_array5= [];
  night_polygon_array1 = [];
  night_polygon_array2 = [];
  night_polygon_array3 = [];
  night_polygon_array4 = [];
  night_polygon_array5 = [];
  
  if(polar_night_flag=="north"){
    var lat_limit = 85;
  }else if(polar_night_flag=="south"){
    var lat_limit = -85;
  }
  
  //Porygon1 
  var night_latitude_array1_length = night_latitude_array1.length;
  var night_longitude_array1_length = night_longitude_array1.length;
  
  if (night_latitude_array1_length>0){
  if(polar_night_flag!="none"){night_polygon_array1.push(new GLatLng(lat_limit,night_longitude_array1[0]));}
  night_polygon_array1.push(new GLatLng(night_latitude_array1[0],night_longitude_array1[0]));
  for (i = 0; i < night_latitude_array1_length; i++) {
    night_polygon_array1.push(new GLatLng(night_latitude_array1[i],night_longitude_array1[i]));    
    night_polyline_array1.push(new GLatLng(night_latitude_array1[i],night_longitude_array1[i]));    
  }
  night_polygon_array1.push(new GLatLng(night_latitude_array1[0],night_longitude_array1[night_longitude_array1.length-1]));
  if(polar_night_flag!="none"){night_polygon_array1.push(new GLatLng(lat_limit,night_longitude_array1[night_longitude_array1.length-1]));}
  night_polygon_array1.push(night_polygon_array1[0]);
  }
  if((night_latitude_array1[night_latitude_array1_length-1]==night_latitude_array1[night_latitude_array1_length-2])&&(night_longitude_array1[night_longitude_array1_length-1]!=night_longitude_array1[night_longitude_array1_length-2])){
      night_polyline_array1.pop();  
  }

  //Porygon2
  var night_latitude_array2_length = night_latitude_array2.length;
  var night_longitude_array2_length = night_longitude_array2.length;
  if (night_latitude_array2_length>0){
  if(polar_night_flag!="none"){night_polygon_array2.push(new GLatLng(lat_limit,night_longitude_array2[0]));}
    night_polygon_array2.push(new GLatLng(night_latitude_array1[0],night_longitude_array2[0]));
    for (i = 0; i < night_latitude_array2_length; i++) {
      night_polygon_array2.push(new GLatLng(night_latitude_array2[i],night_longitude_array2[i]));    
      night_polyline_array2.push(new GLatLng(night_latitude_array2[i],night_longitude_array2[i]));    
    }
    night_polygon_array2.push(new GLatLng(night_latitude_array1[0],night_longitude_array2[night_longitude_array2_length-1]));
  if(polar_night_flag!="none"){night_polygon_array2.push(new GLatLng(lat_limit,night_longitude_array2[night_longitude_array2.length-1]));}
    night_polygon_array2.push(night_polygon_array2[0]);
  }
  if((night_latitude_array2[night_latitude_array2_length-1]==night_latitude_array2[night_latitude_array2_length-2])&&(night_longitude_array2[night_longitude_array2_length-1]!=night_longitude_array2[night_longitude_array2_length-2])){
      night_polyline_array2.pop();  
  }
  if((night_latitude_array2[0]==night_latitude_array2[1])&&(night_longitude_array2[0]!=night_longitude_array2[1])){
      night_polyline_array2.shift();  
  }

  //Porygon3
  var night_latitude_array3_length = night_latitude_array3.length;
  var night_longitude_array3_length = night_longitude_array3.length;
  if (night_latitude_array3_length>0){
  if(polar_night_flag!="none"){night_polygon_array3.push(new GLatLng(lat_limit,night_longitude_array3[0]));}
    night_polygon_array3.push(new GLatLng(night_latitude_array1[0],night_longitude_array3[0]));
    for (i = 0; i < night_latitude_array3_length; i++) {
      night_polygon_array3.push(new GLatLng(night_latitude_array3[i],night_longitude_array3[i]));    
      night_polyline_array3.push(new GLatLng(night_latitude_array3[i],night_longitude_array3[i]));    
    }
    night_polygon_array3.push(new GLatLng(night_latitude_array1[0],night_longitude_array3[night_longitude_array3_length-1]));
  if(polar_night_flag!="none"){night_polygon_array3.push(new GLatLng(lat_limit,night_longitude_array3[night_longitude_array3.length-1]));}
    night_polygon_array3.push(night_polygon_array3[0]);
  }
  if((night_latitude_array3[night_latitude_array3_length-1]==night_latitude_array3[night_latitude_array3_length-2])&&(night_longitude_array3[night_longitude_array3_length-1]!=night_longitude_array3[night_longitude_array3_length-2])){
      night_polyline_array3.pop();  
  }
  if((night_latitude_array3[0]==night_latitude_array3[1])&&(night_longitude_array3[0]!=night_longitude_array3[1])){
      night_polyline_array3.shift();  
  }

  //Porygon4
  var night_latitude_array4_length = night_latitude_array4.length;
  var night_longitude_array4_length = night_longitude_array4.length;
  if (night_latitude_array4_length>0){
  if(polar_night_flag != "none"){night_polygon_array4.push(new GLatLng(lat_limit,night_longitude_array4[0]));}
    night_polygon_array4.push(new GLatLng(night_latitude_array1[0],night_longitude_array4[0]));
    for (i = 0; i < night_latitude_array4_length; i++) {
      night_polygon_array4.push(new GLatLng(night_latitude_array4[i],night_longitude_array4[i]));    
      night_polyline_array4.push(new GLatLng(night_latitude_array4[i],night_longitude_array4[i]));    
    }
    night_polygon_array4.push(new GLatLng(night_latitude_array1[0],night_longitude_array4[night_longitude_array4.length-1]));
  if(polar_night_flag!="none"){night_polygon_array4.push(new GLatLng(lat_limit,night_longitude_array4[night_longitude_array4.length-1]));}
    night_polygon_array4.push(night_polygon_array4[0]);
 }
  if((night_latitude_array4[night_latitude_array4_length-1]==night_latitude_array4[night_latitude_array4_length-2])&&(night_longitude_array4[night_longitude_array4_length-1]!=night_longitude_array4[night_longitude_array4_length-2])){
      night_polyline_array4.pop();  
  }
  if((night_latitude_array4[0]==night_latitude_array4[1])&&(night_longitude_array4[0]!=night_longitude_array4[1])){
      night_polyline_array4.shift();  
  }

  //Porygon5
  var night_latitude_array5_length = night_latitude_array5.length;
  var night_longitude_array5_length = night_longitude_array5.length;
  if (night_latitude_array5_length>1){
  if(polar_night_flag!="none"){night_polygon_array5.push(new GLatLng(lat_limit,night_longitude_array5[0]));}
    night_polygon_array5.push(new GLatLng(night_latitude_array1[0],night_longitude_array5[0]));
    for (i = 0; i < night_latitude_array5_length; i++) {
      night_polygon_array5.push(new GLatLng(night_latitude_array5[i],night_longitude_array5[i]));    
      night_polyline_array5.push(new GLatLng(night_latitude_array5[i],night_longitude_array5[i]));    
    }
  if(polar_night_flag!="none"){night_polygon_array5.push(new GLatLng(lat_limit,night_longitude_array5[night_longitude_array5.length-1]));}
    night_polygon_array5.push(night_polygon_array5[0]);
  }


if (night_shade){
  if (night_polygon_array1.length>0){
    night_polygon1 = new GPolygon(night_polygon_array1, "#000000",0.3, 0, "#000000", 0.3);
    map.addOverlay(night_polygon1);
  }
  
  if (night_polygon_array2.length>0){
    var night_polygon2 = new GPolygon(night_polygon_array2, "#000000",0.3, 0, "#000000", 0.3);
   map.addOverlay(night_polygon2);
  }
  
  if (night_polygon_array3.length>0){
    night_polygon3 = new GPolygon(night_polygon_array3, "#000000",0.3, 0, "#000000", 0.3);
    map.addOverlay(night_polygon3);
  }
  if (night_polygon_array4.length>0){
    night_polygon4 = new GPolygon(night_polygon_array4, "#000000",0.3, 0, "#000000", 0.3);
    map.addOverlay(night_polygon4);
  }
  if (night_polygon_array5.length>0){
    night_polygon5 = new GPolygon(night_polygon_array5, "#000000",0.3, 0, "#000000", 0.3);
    map.addOverlay(night_polygon5);
  }
}

if (boundary){
  var line_color = "#000000";
  var line_width = 2;
  var line_opacity = 0.3;
    night_polyline1 = new GPolyline(night_polyline_array1, line_color, line_width, line_opacity);
    map.addOverlay(night_polyline1);

  if (night_polyline_array2.length>0){
    var night_polyline2 = new GPolyline(night_polyline_array2, line_color, line_width, line_opacity);
    map.addOverlay(night_polyline2);
  }
  if (night_polyline_array3.length>0){
    night_polyline3 = new GPolyline(night_polyline_array3, line_color, line_width, line_opacity);
    map.addOverlay(night_polyline3);
  }
  if (night_polyline_array4.length>0){
    night_polyline4 = new GPolyline(night_polyline_array4, line_color, line_width, line_opacity);
    map.addOverlay(night_polyline4);
  }
  if (night_polyline_array5.length>0){
    night_polyline5 = new GPolyline(night_polyline_array5, line_color, line_width, line_opacity);
    map.addOverlay(night_polyline5);
  }

  }
}

var night_polygon1;
var night_polygon2;
var night_polygon3;
var night_polygon4;
var night_polygon5;
var night_polyline1;
var night_polyline2;
var night_polyline3;
var night_polyline4;
var night_polyline5;