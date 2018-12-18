// JavaScript Document
var xmlHttp

function showUser()
 { 
 xmlHttp=GetXmlHttpObject()
 if (xmlHttp==null)
  {
  alert ("Browser does not support HTTP Request")
  return
  } 
 var url="check_last_epoch_xml.php"
 xmlHttp.onreadystatechange=stateChanged 
 xmlHttp.open("GET",url,true)
 xmlHttp.send(null)
 }

function stateChanged() 
{ 
if (xmlHttp.readyState==4 || xmlHttp.readyState=="complete")
{
 xmlDoc=xmlHttp.responseXML;
 document.getElementById("post_epoch").innerHTML=
 xmlDoc.getElementsByTagName("post_epoch")[0].childNodes[0].nodeValue;
 document.getElementById("post_date").innerHTML=
 xmlDoc.getElementsByTagName("post_date")[0].childNodes[0].nodeValue;
 document.getElementById("time_stamp").innerHTML=
 xmlDoc.getElementsByTagName("time_stamp")[0].childNodes[0].nodeValue;
 }
} 

function GetXmlHttpObject()
 { 
 var objXMLHttp=null
 if (window.XMLHttpRequest)
  {
  objXMLHttp=new XMLHttpRequest()
  }
 else if (window.ActiveXObject)
  {
  objXMLHttp=new ActiveXObject("Microsoft.XMLHTTP")
  }
 return objXMLHttp
 }