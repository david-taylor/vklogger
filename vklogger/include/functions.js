//functions.js
// v18 - Added setFocus() function, entry renamed to chat to prevent conflict with div id="entry" in insert.php
// v19 - Sound routine added
// v20 - line 104 modified to test idLast value !=0. This prevents sound firing off on very time
// v25 - Add chat functionality
// v26 - Added dynamic map default changes with Logger change
// v27 - Chat functions merged into this functions file
// v28 - Added URIDecode in function submitChat() so thab + sign passes
// v29 - Changed HF Logger title to include LF & MF
// v30 - Date Picker functions added
// v31 - Chat timer changed from 25s to 30s
// v32 20-12-15 Task(T) modified so that it updates the Left table anyway without polling beforehand to reduce CPU usage. Sound alert can't be used.
// v33 29-12-15 Chat Timeout reduced from 720 minutes to 120 minutes

function startUpBasic(tableId) {
	
 startChat(chatId);
 if (tableId==1) { document.getElementById('loggerTitle').innerHTML = '2m & above'; loggerName='2m and above Logger'; } 
 if (tableId==2) { document.getElementById('loggerTitle').innerHTML ='6m'; loggerName='6m Logger'; }
 if (tableId==3) { document.getElementById('loggerTitle').innerHTML = 'LF/MF/HF'; loggerName='HF Logger'; }

 taskT(tableId); // Manually run AJAX update_table
 taskO(tableId); // Manually run AJAX update_online list & clock
 setTimers();    // Set all AJAX timers to run here after
}

function startUpNor(tableId) {

 startChat(chatId);

 hidePanel('tools');	
 hidePanel('toolresults');
 hidePanel('opinfo');
 
 if (tableId==1) { 
  document.getElementById('loggerTitle').innerHTML = '2m & above'; loggerName='2m and above Logger'; 
  document.getElementById('legend').src='http://www.vklogger.com/images/legend_1.gif'; 
  } 

 if (tableId==2) { 
  document.getElementById('loggerTitle').innerHTML ='6m'; loggerName='6m Logger'; 
  document.getElementById('legend').src='http://www.vklogger.com/images/legend_2.gif';  
 }

 if (tableId==3) { 
  document.getElementById('loggerTitle').innerHTML = 'LF/MF/HF'; loggerName='HF Logger'; 
  document.getElementById('legend').src='http://www.vklogger.com/images/legend_3.gif';  
 }

 taskT(tableId); // Manually run AJAX update_table
 taskO(tableId); // Manually run AJAX update_online list & clock
 taskF();        // Manually run AJAX update_forum
 taskM(tableId); // Manually run AJAX update_map
 setTimers();    // Set all AJAX timers to run here after
}

function startChat(chatId){
 window.timerChat = setInterval ("taskChat()",30000);  // Set timer for Chat 
 taskChat(chatId);  // Run AJAX Chat task
}

function showChat(chatId){
if (YAHOO.example.container.chat_main.cfg.getProperty("visible")) { return; } else { startChat(chatId); } //Prevent manual updates by clicking away with Show Chat link
}

function storeChatXY() {
 setcookie('chatX', YAHOO.example.container.chat_main.cfg.getProperty('x'), 100);	
 setcookie('chatY', YAHOO.example.container.chat_main.cfg.getProperty('y'), 100);	
}

function changeLogger(newTableId) {

try {   // try/catch is used to error trap when main frame is loaded with Terms page or Contact Us page (which lack the req'd DIV IDs and would cause errors)

 if (newTableId==window.tableId) { alert("ERROR - Cannot change\n You have selected the same Logger!"); return; } // Check for same Logger to prevent manual refreshes!

 window.tableId=newTableId;  // Update tableId now

// alert("Returning to "+loggerName);	
// self.location.href='main.php?table='+newTableId;

 setcookie('current_logger', newTableId, 100);
 
 if (newTableId==1) { document.getElementById('loggerTitle').innerHTML = '2m \& above'; document.getElementById('legend').src='http://www.vklogger.com/images/legend_1.gif'; } 
 if (newTableId==2) { document.getElementById('loggerTitle').innerHTML ='6m';  document.getElementById('legend').src='http://www.vklogger.com/images/legend_2.gif';}
 if (newTableId==3) { document.getElementById('loggerTitle').innerHTML = 'LF/MF/HF'; document.getElementById('legend').src='http://www.vklogger.com/images/legend_3.gif';}
 
 runAjax ('left','update_table.php?table='+newTableId);
 runAjax ('idlast','update_id.php?table='+newTableId);
 runAjax ('idnow','update_id.php?table='+newTableId);  //This was added to try and stop false newMessageSound when self posting

// if (newTableId==1) { alert("Changing to:\n 2m & above Logger"); } 
// if (newTableId==2) { alert("Changing to:\n 6m Logger"); } 
// if (newTableId==3) { alert("Changing to:\n HF Logger"); } 

// if (newTableId!=3) { showPanel('gmap'); } else {hidePanel('gmap'); } // Hide DX Path Map with change to HF Logger else Show
if (newTableId==1) { lat=latvuhf; lng=lngvuhf; zoom=zoomvuhf; minres=minresvuhf; maxres=maxresvuhf; }
if (newTableId==2) { lat=lat6m; lng=lng6m; zoom=zoom6m; minres=minres6m; maxres=maxres6m;}
if (newTableId==3) { lat=lathf; lng=lnghf; zoom=zoomhf; minres=minreshf; maxres=maxreshf;}
 map.setCenter(new GLatLng(lat, lng), zoom);
 
 readMap('update_map.php?table='+newTableId); // Update Map	
 runAjax ('online','update_online.php?table='+newTableId);  // Update User Online List
 
} catch(error) { window.location="main.php?table="+newTableId; }
 
} // end of function

function openOverlay(panel) {
 showPanel('overlay');
 document.getElementById('content').style.opacity=0.3;
 document.getElementById('content').style.filter="alpha(opacity=30)";
 if (panel=='ucp') { runAjax ('overlay','ucp.php'); }
 if (panel=='acp') { runAjax ('overlay','acp.php'); }
 if (panel=='contact') { runAjax ('overlay','contact.php'); }
 if (panel=='donate') { runAjax ('overlay','donate.php'); }
 if (panel=='tou') { runAjax ('overlay','tou.php'); }
}

function closeOverlay(id) {
 hidePanel('overlay'); 
 if (id=='findgrid') { hidePanel('findgrid'); document.getElementById('findgrid').innerHTML = ''; }
 document.getElementById('content').style.opacity=1;
 document.getElementById('content').style.filter="alpha(opacity=100)";
 try { document.getElementById('content').style.removeAttribute('filter'); }
 catch(err)
 { }
 document.getElementById('overlay').innerHTML = '';

  if (id=='ucpsettings') {
	 alert("Standby\nReturning to Default Logger with new settings\n");
     window.location="main.php?new_start=1";
   }
}

 function clearChatEntry(){ 
   document.forms.chatForm.chat_msg.value=''; 
  }

function changeChat(value) { 
   chatId=value;  
   // alert("debug: Chat selected is "+chatId); 
   taskChat('change');
  }

function clickUser(clickedUser) { 
   document.forms.chatForm.chat_msg.value=clickedUser+": " ;
   document.getElementById('chat_msg').focus(); 
  }

function addEmoticon(emoticon) { 
   document.forms.chatForm.chat_msg.value=document.forms.chatForm.chat_msg.value+' '+emoticon+' ';
   document.getElementById('chat_msg').focus(); 
  }

function changeDate() {
  setcookie('chatdate',document.getElementById('chat_date').checked,100);
  taskChat('change'); 	
}

function changeRxColor() {
   setcookie('chat_rxcolor',document.getElementById('chat_rxcolor').value,100); 
   taskChat('change'); 
   document.getElementById('chat_msg').focus(); 
}

function changeTxColor() {
   setcookie('chat_txcolor',document.getElementById('chat_txcolor').value,100); 
   document.getElementById('chat_msg').focus();
}


function stopEnterKey(evt) {
  var evt = (evt) ? evt : ((event) ? event : null);
  var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
  if ((evt.keyCode == 13) && (node.type=="text"))  { submitChat(document.getElementById('chatForm'),'process_chat.php?table='+chatId,'chat_messages');clearChatEntry(); return false;}
} 

function findGrid(findUser) {
 showPanel('findgrid');
 document.getElementById('content').style.opacity=0.3;
 document.getElementById('content').style.filter="alpha(opacity=30)";
 runAjax ('findgrid','find_grid.php?find_entry='+findUser); 
}

function updateDxGrid(useThisCall,useThisGrid) {
 top.insert.document.getElementById("entry_dx").value=useThisCall;
 top.insert.document.getElementById("entry_dx_grid").value=useThisGrid;
 closeOverlay('findgrid');
}

function showPanel(panel) { document.getElementById(panel).style.display = "block"; }
function hidePanel(panel) { document.getElementById(panel).style.display = "none";  }
function getopinfo(get_user) { runAjax ('opinfo','update_opinfo.php?get_user='+get_user); }
function runCalc(find_entry,find_type,mylat,mylon) { runAjax ('calc_result', 'update_calc_result.php?find_entry='+find_entry+'&find_type='+find_type+'&mylat='+mylat+'&mylon='+mylon); }

function doTools(toolId) { 
 showPanel('toolresults');
 document.getElementById('toolresults').innerHTML = '&nbsp; Loading...';
 if (toolId==1) { runAjax ('toolresults','update_calc.php'); }
 if (toolId==2) { runAjax ('toolresults','update_solar.php'); }
 if (toolId==3) { runAjax ('toolresults','update_logger.php?logger=1'); }
 if (toolId==4) { runAjax ('toolresults','update_logger.php?logger=2'); }
 if (toolId==5) { runAjax ('toolresults','update_logger.php?logger=3'); }
 if (toolId==6) { runAjax ('toolresults','update_updates.php'); }
 if (toolId==7) { runAjax ('toolresults','update_dxs.php?band=2'); }
 if (toolId==8) { runAjax ('toolresults','update_dxs.php?band=3'); }
 if (toolId==9) { runAjax ('toolresults','update_hepburn.php'); }
 setTimeout("document.forms.toolform.toolselect.value='';",1000);
}

function taskT(tableId) {
// runAjax ('idnow','update_id.php?table='+tableId);
// if (document.getElementById("idnow").firstChild.nodeValue!=document.getElementById("idlast").firstChild.nodeValue) { 

   runAjax ('left','update_table.php?table='+tableId);

//   runAjax ('idlast','update_id.php?table='+tableId);
//   if (document.getElementById("idnow").firstChild.nodeValue>document.getElementById("idlast").firstChild.nodeValue&&document.getElementById("idlast").firstChild.nodeValue!=0) {  newMessageAlert(); } //Play sound on new posts only & not if latest post is deleted
//} 
//alert ("Now: "+document.getElementById("idnow").firstChild.nodeValue+" Last: "+document.getElementById("idlast").firstChild.nodeValue);
}

function taskTManual(tableId) {
 runAjax ('left','update_table.php?table='+tableId);
 runAjax ('idlast','update_id.php?table='+tableId);
 runAjax ('idnow','update_id.php?table='+tableId);  //This was added to try and stop false newMessageSound when self posting
}

function taskO(tableId) {
// runAjax ('online','update_online.php?table='+tableId);
 setTimeout(function(){ runAjax ('online','update_online.php?table='+tableId); tableId=null;},500);  // Delay this task to avoid timer collisions	
}
	
function taskF() {
  runAjax ('forum','update_forum.php');
}

function taskM(tableId) {
 readMap('update_map.php?table='+window.tableId); 
}


function taskCalc() {
 runAjax ('calc','update_calc.php'); 
}


function deletePost(table,id,deleteMode) {
  if (confirm("Delete this post - Are you sure?")) { 
   runAjax ('hidden','delete_post.php?table='+table+'&id='+id+'&delete_mode='+deleteMode); 
   runAjax ('left','update_table.php?table='+table);
   runAjax ('idlast','update_id.php?table='+table);	
    if (getcookie('display_mode')!=1) {taskM(table);} // Don't Update Map in Basic Display Mode
	} 
}

function historyDeletePost(table,id,deleteMode) {
  if (confirm("Permanently Delete this post - Are you sure?")) { 
   runAjax ('hidden_history','delete_post.php?table='+table+'&id='+id+'&delete_mode='+deleteMode); 
  refreshHistory();
	} 
}

function refreshHistory() {
   get(document.getElementById('myform1'));   
}

function editPost(table,id) {
  if (confirm("Edit this post - Are you sure?")) { 
//	runAjax ('hidden','edit_post.php?table='+table+'&id='+id); 
   return true;
	} else { return false; }
}

function historyEditPost(table,id) {
  if (confirm("Edit this post - Are you sure?")) { 
//	runAjax ('hidden','edit_post.php?table='+table+'&id='+id); 
   return true;
	} else { return false; }
}


function showHide(d) {
 if(d.length < 1) { return; }
 if(document.getElementById(d).style.display == "none") { document.getElementById(d).style.display = "block"; }
 else { document.getElementById(d).style.display = "none"; }

if((d=="tools")&&(document.getElementById('toolresults').style.display == "block")) { document.getElementById('toolresults').style.display = "none"; document.getElementById('toolresults').innerHTML = ''; }

}

function doCalc(d) {
 if(d.length < 1) { return; }
 if(document.getElementById(d).style.display == "none") { 
   document.getElementById(d).style.display = "block"; 
	 	runAjax ('tools','update_calc.php');
	 }
 else { document.getElementById(d).style.display = "none"; }
}

function showContactMenu(d) {
 document.getElementById('messages').innerHTML = '';
 document.getElementById('menu0').style.display = "none"; 	
 document.getElementById('menu1').style.display = "none"; 
 document.getElementById('menu2').style.display = "none"; 
 document.getElementById('menu3').style.display = "none"; 
 document.getElementById('menu4').style.display = "none"; 
 document.getElementById('menu5').style.display = "none"; 
 document.getElementById(d).style.display = "inline"; 
}

function reveal() {
 document.getElementById('url').style.display="none";
 document.getElementById('subject').style.display="none"; 
 if (document.formEnquiry.enquiry_type.value=="other") { document.getElementById('subject').style.display="inline"; setFocus('subject'); document.getElementById('subject').select();
}
 if (document.formEnquiry.enquiry_type.value=="url_add"||document.formEnquiry.enquiry_type.value=="url_broken") { document.getElementById('url').style.display="inline"; 
  setTimeout("setFocus('url')",500); }
}

function showSearch(d) {
 document.getElementById('search1').style.display = "none"; 
 document.getElementById('search2').style.display = "none"; 
 document.getElementById('search3').style.display = "none"; 
 document.getElementById('search4').style.display = "none"; 
 document.getElementById('search5').style.display = "none"; 
 document.getElementById(d).style.display = "inline"; 
}

function showUcpMenu(d) {
 document.getElementById('messages').innerHTML = '';
 document.getElementById('menu0').style.display = "none"; 	
 document.getElementById('menu1').style.display = "none"; 
 document.getElementById('menu2').style.display = "none"; 
 document.getElementById('menu3').style.display = "none"; 
 document.getElementById('menu4').style.display = "none"; 
 document.getElementById(d).style.display = "inline"; 
}

function showAcpMenu(d) {
 document.getElementById('messages').innerHTML = '';
 document.getElementById('menu0').style.display = "none"; 	
 document.getElementById('menu1').style.display = "none"; 
 document.getElementById('menu2').style.display = "none"; 
 document.getElementById('menu3').style.display = "none"; 
 document.getElementById('menu4').style.display = "none"; 
 document.getElementById(d).style.display = "inline"; 
}


function showTestButton(divId) {
 document.getElementById(divId).style.display = "none"; 
 n=document.getElementById('sound_select').value;
 if (n!=0) { document.getElementById(divId).style.display = "inline"; }
}

function fc(){document.forms[0].chat.focus()}

function setFocus(field){ 
  document.getElementById(field).focus(); 
}

function clearForm(formName){
	
 if (formName=='entryForm') {
   setTimeout("document.forms.entryForm.entry_id.value='';",200);
   setTimeout("document.forms.entryForm.entry_status.value='';",200);
   setTimeout("document.forms.entryForm.entry_reporter.value='';",200);
   setTimeout("document.forms.entryForm.entry_reporter_grid.value='';",200);
   setTimeout("document.forms.entryForm.entry_dx.value='';",200);
   setTimeout("document.forms.entryForm.entry_dx_grid.value='';",200);
   setTimeout("document.forms.entryForm.entry_freq.value='';",200);
   setTimeout("document.forms.entryForm.chat_copy.value='';",200);
   setTimeout("document.forms.entryForm.entry_bearing.value='';",200);
   setTimeout("document.forms.entryForm.entry_distance.value='';",200);   
   setTimeout("document.forms.entryForm.chat.value='';setFocus('entry_dx')",200);   
  }
}

function clearCalc(){
setTimeout("document.forms.calcForm.find_entry.value='';document.forms.calcForm.find_entry.focus()",200);
}

function sp(m){a=document.forms[0].chat;a.value=a.value+m}

function runAjax(objID, serverPage) {
	
//	document.getElementById('ajaxnow').innerHTML = " Div id="+objID+" &nbsp; &nbsp; calling:"+serverPage; // debug
//	document.getElementById('tableIdCheck').innerHTML = tableId;  //debug

	//Create a boolean variable to check for a valid Internet Explorer instance.
	var xmlhttp = false;
	
	//Check if we are using IE.
	try {
		//If the Javascript version is greater than 5.
		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		//If not, then use the older active x object.
		try {
			//If we are using MS.
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (E) {
			//Else we must be using a non-IE browser.
			xmlhttp = false;
		}
	}
	
	//If we are using a non-IE browser, create a javascript instance of the object.
	if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
		xmlhttp = new XMLHttpRequest();
	}
	
	
	/*
	var xmlhttp;
	
	//If, the activexobject is available, we must be using IE.
	if (window.ActiveXObject){
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		//Else, we can use the native Javascript handler.
		xmlhttp = new XMLHttpRequest();
	}
	*/
	
		var obj = document.getElementById(objID);
		xmlhttp.open("GET", serverPage);
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				obj.innerHTML = xmlhttp.responseText;
			}
		}
		xmlhttp.send(null);
		
} 


function getxmlhttp() {

	//Create a boolean variable to check for a valid Internet Explorer instance.
	var xmlhttp = false;
	
	//Check if we are using IE.
	try {
		//If the Javascript version is greater than 5.
		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
		//If not, then use the older active x object.
		try {
			//If we are using MS.
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (E) {
			//Else we must be using a non-IE browser.
			xmlhttp = false;
		}
	}
	
	//If we are using a non-IE browser, create a javascript instance of the object.
	if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
		xmlhttp = new XMLHttpRequest();
	}
return xmlhttp;
}


function processajax(serverPage, obj, getOrPost, str) {
	
//	document.getElementById('ajaxnow').innerHTML = " Div id="+obj+" &nbsp; &nbsp; calling:"+serverPage+" "+getOrPost;  //debug
//	document.getElementById('tableIdCheck').innerHTML = tableId;   //debug

xmlhttp = getxmlhttp();

    if (getOrPost=="get"){ 
		xmlhttp.open("GET", serverPage);
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				obj.innerHTML = xmlhttp.responseText;
			}
		}
		xmlhttp.send(null);
	} else {

xmlhttp.open("POST", serverPage, true);
xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
xmlhttp.onreadystatechange=function() {
	if (xmlhttp.readyState==4 && xmlhttp.status==200) {
		obj.innerHTML=xmlhttp.responseText;
	}
}
xmlhttp.send(str);
	}


} // end of process ajax function


//Functions to submit a form.
function getformvalues (fobj, valfunc){
		
		var str = "";
		aok = true;
		var val;
		
		//Run through a list of all objects contained within the form.
		for(var i = 0; i < fobj.elements.length; i++){
			if(valfunc) {
				if (aok == true){
					val = valfunc (fobj.elements[i].value,fobj.elements[i].name); 
					if (val == false){
						aok = false;
					}
				}
			}
			str += fobj.elements[i].name + "=" + escape(fobj.elements[i].value) + "&";
		}
		//Then return the string values.
		return str;
	}

function submitform (theform, serverPage, objId, valfunc){
		var file = serverPage;
		var str = getformvalues(theform,valfunc);
		//If the validation is ok.
		if (aok == true){
			obj = document.getElementById(objId);
			processajax (serverPage, obj, "post", str);
		}
	}

function submitChat (theform, serverPage, objId, valfunc){
//	alert("Raw entry: "+theform.chat_msg.value);
	theform.chat_msg.value=encodeURIComponent(theform.chat_msg.value);
//		alert("Encoded: "+theform.chat_msg.value);
	
	if (document.forms.chatForm.chat_msg.value=='') { return false; }
	if (window.chatCount<=720) { 
	   submitform(theform, serverPage, objId, valfunc);
       setTimeout("runAjax ('chat_result','update_chat.php?table='+window.chatId+'&chatcount='+window.chatCount)",500);
	   window.chatCount=0;
	}
}

function taskChat(reason){
 if (reason!='change') { window.chatCount++; } // Only increment counter if it a natural update, not a Chat change
 if (window.chatCount>120) { 
   clearInterval(timerChat); 
   alert("Chat Timeout\nPlease sign off/in again to continue");
 } else { runAjax ('chat_result','update_chat.php?table='+window.chatId+'&chatcount='+window.chatCount); }
}

var newWindow = null;


<!--
function getexpirydate(nodays){
 var UTCstring;
 Today = new Date();
 nomilli=Date.parse(Today);
 Today.setTime(nomilli+nodays*24*60*60*1000);
 UTCstring = Today.toUTCString();
 return UTCstring;
}

function getcookie(cookiename) {
 var cookiestring=""+document.cookie;
 var index1=cookiestring.indexOf(cookiename);
 if (index1==-1 || cookiename=="") return ""; 
 var index2=cookiestring.indexOf(';',index1);
 if (index2==-1) index2=cookiestring.length; 
 return unescape(cookiestring.substring(index1+cookiename.length+1,index2));
}

function setcookie(name,value,duration){
 cookiestring=name+"="+escape(value)+";EXPIRES="+getexpirydate(duration);
 document.cookie=cookiestring;
 if(!getcookie(name)){ return false; }
 else{ return true;}
}
//-->

function checkFreq(lLimit,uLimit) {
 if (document.forms[0].entry_dx.value!='') { 
  if (document.forms[0].entry_freq.value<lLimit||document.forms[0].entry_freq.value>uLimit) { alert ("The frequency you have entered is outside the "+lLimit+" - "+uLimit+ "MHz limits of this Logger."); }
  }
}

function timeOutUser() {
 soundfile='include/sound9.mp3';
 document.getElementById("hidden").innerHTML="<embed src=\""+soundfile+"\" hidden=\"true\" autostart=\"true\" loop=\"false\" />";
 parent.insert.document.getElementById('entry').style.display = "none";
 parent.insert.document.getElementById('band_buttons').style.visibility = "hidden";
 parent.main.document.getElementById('content').style.display = "none";
 alert ("Your VK Logger session has expired - Please Sign-Off, and Sign-in again to confirm you are still there.");
}

/**
This is a JavaScript library that will allow you to easily add some basic DHTML
drop-down datepicker functionality to your Notes forms. This script is not as
full-featured as others you may find on the Internet, but it's free, it's easy to
understand, and it's easy to change.

You'll also want to include a stylesheet that makes the datepicker elements
look nice. An example one can be found in the database that this script was
originally released with, at:

http://www.nsftools.com/tips/NotesTips.htm#datepicker

*/

var datePickerDivID = "datepicker";
var iFrameDivID = "datepickeriframe";

var dayArrayShort = new Array('Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa');
var dayArrayMed = new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat');
var dayArrayLong = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
var monthArrayShort = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
var monthArrayMed = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec');
var monthArrayLong = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
 
// these variables define the date formatting we're expecting and outputting.
// If you want to use a different format by default, change the defaultDateSeparator
// and defaultDateFormat variables either here or on your HTML page.
var defaultDateSeparator = "-";        // common values would be "/" or "."
var defaultDateFormat = "dmy"    // valid values are "mdy", "dmy", and "ymd"
var dateSeparator = defaultDateSeparator;
var dateFormat = defaultDateFormat;

/**
This is the main function you'll call from the onClick event of a button.
Normally, you'll have something like this on your HTML page:

Start Date: <input name="StartDate">
<input type=button value="select" onclick="displayDatePicker('StartDate');">

That will cause the datepicker to be displayed beneath the StartDate field and
any date that is chosen will update the value of that field. If you'd rather have the
datepicker display beneath the button that was clicked, you can code the button
like this:

<input type=button value="select" onclick="displayDatePicker('StartDate', this);">

So, pretty much, the first argument (dateFieldName) is a string representing the
name of the field that will be modified if the user picks a date, and the second
argument (displayBelowThisObject) is optional and represents an actual node
on the HTML document that the datepicker should be displayed below.

In version 1.1 of this code, the dtFormat and dtSep variables were added, allowing
you to use a specific date format or date separator for a given call to this function.
Normally, you'll just want to set these defaults globally with the defaultDateSeparator
and defaultDateFormat variables, but it doesn't hurt anything to add them as optional
parameters here. An example of use is:

<input type=button value="select" onclick="displayDatePicker('StartDate', false, 'dmy', '.');">

This would display the datepicker beneath the StartDate field (because the
displayBelowThisObject parameter was false), and update the StartDate field with
the chosen value of the datepicker using a date format of dd.mm.yyyy
*/
function displayDatePicker(dateFieldName, displayBelowThisObject, dtFormat, dtSep)
{
  var targetDateField = document.getElementsByName (dateFieldName).item(0);
 
  // if we weren't told what node to display the datepicker beneath, just display it
  // beneath the date field we're updating
  if (!displayBelowThisObject)
    displayBelowThisObject = targetDateField;
 
  // if a date separator character was given, update the dateSeparator variable
  if (dtSep)
    dateSeparator = dtSep;
  else
    dateSeparator = defaultDateSeparator;
 
  // if a date format was given, update the dateFormat variable
  if (dtFormat)
    dateFormat = dtFormat;
  else
    dateFormat = defaultDateFormat;
 
  var x = displayBelowThisObject.offsetLeft;
  var y = displayBelowThisObject.offsetTop + displayBelowThisObject.offsetHeight ;
 
  // deal with elements inside tables and such
  var parent = displayBelowThisObject;
  while (parent.offsetParent) {
    parent = parent.offsetParent;
    x += parent.offsetLeft;
    y += parent.offsetTop ;
  }
 
  drawDatePicker(targetDateField, x, y);
}


/**
Draw the datepicker object (which is just a table with calendar elements) at the
specified x and y coordinates, using the targetDateField object as the input tag
that will ultimately be populated with a date.

This function will normally be called by the displayDatePicker function.
*/
function drawDatePicker(targetDateField, x, y)
{
  var dt = getFieldDate(targetDateField.value );
 
  // the datepicker table will be drawn inside of a <div> with an ID defined by the
  // global datePickerDivID variable. If such a div doesn't yet exist on the HTML
  // document we're working with, add one.
  if (!document.getElementById(datePickerDivID)) {
    // don't use innerHTML to update the body, because it can cause global variables
    // that are currently pointing to objects on the page to have bad references
    //document.body.innerHTML += "<div id='" + datePickerDivID + "' class='dpDiv'></div>";
    var newNode = document.createElement("div");
    newNode.setAttribute("id", datePickerDivID);
    newNode.setAttribute("class", "dpDiv");
    newNode.setAttribute("style", "visibility: hidden;");
    document.body.appendChild(newNode);
  }
 
  // move the datepicker div to the proper x,y coordinate and toggle the visiblity
  var pickerDiv = document.getElementById(datePickerDivID);
  pickerDiv.style.position = "absolute";
  pickerDiv.style.left = x + "px";
  pickerDiv.style.top = y + "px";
  pickerDiv.style.visibility = (pickerDiv.style.visibility == "visible" ? "hidden" : "visible");
  pickerDiv.style.display = (pickerDiv.style.display == "block" ? "none" : "block");
  pickerDiv.style.zIndex = 10000;
 
  // draw the datepicker table
  refreshDatePicker(targetDateField.name, dt.getFullYear(), dt.getMonth(), dt.getDate());
}


/**
This is the function that actually draws the datepicker calendar.
*/
function refreshDatePicker(dateFieldName, year, month, day)
{
  // if no arguments are passed, use today's date; otherwise, month and year
  // are required (if a day is passed, it will be highlighted later)
  var thisDay = new Date();
 
  if ((month >= 0) && (year > 0)) {
    thisDay = new Date(year, month, 1);
  } else {
    day = thisDay.getDate();
    thisDay.setDate(1);
  }
 
  // the calendar will be drawn as a table
  // you can customize the table elements with a global CSS style sheet,
  // or by hardcoding style and formatting elements below
  var crlf = "\r\n";
  var TABLE = "<table cols=7 class='dpTable'>" + crlf;
  var xTABLE = "</table>" + crlf;
  var TR = "<tr class='dpTR'>";
  var TR_title = "<tr class='dpTitleTR'>";
  var TR_days = "<tr class='dpDayTR'>";
  var TR_todaybutton = "<tr class='dpTodayButtonTR'>";
  var xTR = "</tr>" + crlf;
  var TD = "<td class='dpTD' onMouseOut='this.className=\"dpTD\";' onMouseOver=' this.className=\"dpTDHover\";' ";    // leave this tag open, because we'll be adding an onClick event
  var TD_title = "<td colspan=5 class='dpTitleTD'>";
  var TD_buttons = "<td class='dpButtonTD'>";
  var TD_todaybutton = "<td colspan=7 class='dpTodayButtonTD'>";
  var TD_days = "<td class='dpDayTD'>";
  var TD_selected = "<td class='dpDayHighlightTD' onMouseOut='this.className=\"dpDayHighlightTD\";' onMouseOver='this.className=\"dpTDHover\";' ";    // leave this tag open, because we'll be adding an onClick event
  var xTD = "</td>" + crlf;
  var DIV_title = "<div class='dpTitleText'>";
  var DIV_selected = "<div class='dpDayHighlight'>";
  var xDIV = "</div>";
 
  // start generating the code for the calendar table
  var html = TABLE;
 
  // this is the title bar, which displays the month and the buttons to
  // go back to a previous month or forward to the next month
  html += TR_title;
  html += TD_buttons + getButtonCode(dateFieldName, thisDay, -1, "&lt;") + xTD;
  html += TD_title + DIV_title + monthArrayLong[ thisDay.getMonth()] + " " + thisDay.getFullYear() + xDIV + xTD;
  html += TD_buttons + getButtonCode(dateFieldName, thisDay, 1, "&gt;") + xTD;
  html += xTR;
 
  // this is the row that indicates which day of the week we're on
  html += TR_days;
  for(i = 0; i < dayArrayShort.length; i++)
    html += TD_days + dayArrayShort[i] + xTD;
  html += xTR;
 
  // now we'll start populating the table with days of the month
  html += TR;
 
  // first, the leading blanks
  for (i = 0; i < thisDay.getDay(); i++)
    html += TD + "&nbsp;" + xTD;
 
  // now, the days of the month
  do {
    dayNum = thisDay.getDate();
    TD_onclick = " onclick=\"updateDateField('" + dateFieldName + "', '" + getDateString(thisDay) + "');\">";
    
    if (dayNum == day)
      html += TD_selected + TD_onclick + DIV_selected + dayNum + xDIV + xTD;
    else
      html += TD + TD_onclick + dayNum + xTD;
    
    // if this is a Saturday, start a new row
    if (thisDay.getDay() == 6)
      html += xTR + TR;
    
    // increment the day
    thisDay.setDate(thisDay.getDate() + 1);
  } while (thisDay.getDate() > 1)
 
  // fill in any trailing blanks
  if (thisDay.getDay() > 0) {
    for (i = 6; i > thisDay.getDay(); i--)
      html += TD + "&nbsp;" + xTD;
  }
  html += xTR;
 
  // add a button to allow the user to easily return to today, or close the calendar
  var today = new Date();
  var todayString = "Today is " + dayArrayMed[today.getDay()] + ", " + monthArrayMed[ today.getMonth()] + " " + today.getDate();
  html += TR_todaybutton + TD_todaybutton;
  html += "<button class='dpTodayButton' onClick='refreshDatePicker(\"" + dateFieldName + "\");'>this month</button> ";
  html += "<button class='dpTodayButton' onClick='updateDateField(\"" + dateFieldName + "\");'>close</button>";
  html += xTD + xTR;
 
  // and finally, close the table
  html += xTABLE;
 
  document.getElementById(datePickerDivID).innerHTML = html;
  // add an "iFrame shim" to allow the datepicker to display above selection lists
  adjustiFrame();
}


/**
Convenience function for writing the code for the buttons that bring us back or forward
a month.
*/
function getButtonCode(dateFieldName, dateVal, adjust, label)
{
  var newMonth = (dateVal.getMonth () + adjust) % 12;
  var newYear = dateVal.getFullYear() + parseInt((dateVal.getMonth() + adjust) / 12);
  if (newMonth < 0) {
    newMonth += 12;
    newYear += -1;
  }
 
  return "<button class='dpButton' onClick='refreshDatePicker(\"" + dateFieldName + "\", " + newYear + ", " + newMonth + ");'>" + label + "</button>";
}


/**
Convert a JavaScript Date object to a string, based on the dateFormat and dateSeparator
variables at the beginning of this script library.
*/
function getDateString(dateVal)
{
  var dayString = "00" + dateVal.getDate();
  var monthString = "00" + (dateVal.getMonth()+1);
  dayString = dayString.substring(dayString.length - 2);
  monthString = monthString.substring(monthString.length - 2);
 
  switch (dateFormat) {
    case "dmy" :
      return dayString + dateSeparator + monthString + dateSeparator + dateVal.getFullYear();
    case "ymd" :
      return dateVal.getFullYear() + dateSeparator + monthString + dateSeparator + dayString;
    case "mdy" :
    default :
      return monthString + dateSeparator + dayString + dateSeparator + dateVal.getFullYear();
  }
}


/**
Convert a string to a JavaScript Date object.
*/
function getFieldDate(dateString)
{
  var dateVal;
  var dArray;
  var d, m, y;
 
  try {
    dArray = splitDateString(dateString);
    if (dArray) {
      switch (dateFormat) {
        case "dmy" :
          d = parseInt(dArray[0], 10);
          m = parseInt(dArray[1], 10) - 1;
          y = parseInt(dArray[2], 10);
          break;
        case "ymd" :
          d = parseInt(dArray[2], 10);
          m = parseInt(dArray[1], 10) - 1;
          y = parseInt(dArray[0], 10);
          break;
        case "mdy" :
        default :
          d = parseInt(dArray[1], 10);
          m = parseInt(dArray[0], 10) - 1;
          y = parseInt(dArray[2], 10);
          break;
      }
      dateVal = new Date(y, m, d);
    } else if (dateString) {
      dateVal = new Date(dateString);
    } else {
      dateVal = new Date();
    }
  } catch(e) {
    dateVal = new Date();
  }
 
  return dateVal;
}


/**
Try to split a date string into an array of elements, using common date separators.
If the date is split, an array is returned; otherwise, we just return false.
*/
function splitDateString(dateString)
{
  var dArray;
  if (dateString.indexOf("/") >= 0)
    dArray = dateString.split("/");
  else if (dateString.indexOf(".") >= 0)
    dArray = dateString.split(".");
  else if (dateString.indexOf("-") >= 0)
    dArray = dateString.split("-");
  else if (dateString.indexOf("\\") >= 0)
    dArray = dateString.split("\\");
  else
    dArray = false;
 
  return dArray;
}

/**
Update the field with the given dateFieldName with the dateString that has been passed,
and hide the datepicker. If no dateString is passed, just close the datepicker without
changing the field value.

Also, if the page developer has defined a function called datePickerClosed anywhere on
the page or in an imported library, we will attempt to run that function with the updated
field as a parameter. This can be used for such things as date validation, setting default
values for related fields, etc. For example, you might have a function like this to validate
a start date field:

function datePickerClosed(dateField)
{
  var dateObj = getFieldDate(dateField.value);
  var today = new Date();
  today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
 
  if (dateField.name == "StartDate") {
    if (dateObj < today) {
      // if the date is before today, alert the user and display the datepicker again
      alert("Please enter a date that is today or later");
      dateField.value = "";
      document.getElementById(datePickerDivID).style.visibility = "visible";
      adjustiFrame();
    } else {
      // if the date is okay, set the EndDate field to 7 days after the StartDate
      dateObj.setTime(dateObj.getTime() + (7 * 24 * 60 * 60 * 1000));
      var endDateField = document.getElementsByName ("EndDate").item(0);
      endDateField.value = getDateString(dateObj);
    }
  }
}

*/
function updateDateField(dateFieldName, dateString)
{
  var targetDateField = document.getElementsByName (dateFieldName).item(0);
  if (dateString)
    targetDateField.value = dateString;
 
  var pickerDiv = document.getElementById(datePickerDivID);
  pickerDiv.style.visibility = "hidden";
  pickerDiv.style.display = "none";
 
  adjustiFrame();
  targetDateField.focus();
 
  // after the datepicker has closed, optionally run a user-defined function called
  // datePickerClosed, passing the field that was just updated as a parameter
  // (note that this will only run if the user actually selected a date from the datepicker)
  if ((dateString) && (typeof(datePickerClosed) == "function"))
    datePickerClosed(targetDateField);
}


/**
Use an "iFrame shim" to deal with problems where the datepicker shows up behind
selection list elements, if they're below the datepicker. The problem and solution are
described at:

http://dotnetjunkies.com/WebLog/jking/archive/2003/07/21/488.aspx
http://dotnetjunkies.com/WebLog/jking/archive/2003/10/30/2975.aspx
*/
function adjustiFrame(pickerDiv, iFrameDiv)
{
  // we know that Opera doesn't like something about this, so if we
  // think we're using Opera, don't even try
  var is_opera = (navigator.userAgent.toLowerCase().indexOf("opera") != -1);
  if (is_opera)
    return;
  
  // put a try/catch block around the whole thing, just in case
  try {
    if (!document.getElementById(iFrameDivID)) {
      // don't use innerHTML to update the body, because it can cause global variables
      // that are currently pointing to objects on the page to have bad references
      //document.body.innerHTML += "<iframe id='" + iFrameDivID + "' src='javascript:false;' scrolling='no' frameborder='0'>";
      var newNode = document.createElement("iFrame");
      newNode.setAttribute("id", iFrameDivID);
      newNode.setAttribute("src", "javascript:false;");
      newNode.setAttribute("scrolling", "no");
      newNode.setAttribute ("frameborder", "0");
      document.body.appendChild(newNode);
    }
    
    if (!pickerDiv)
      pickerDiv = document.getElementById(datePickerDivID);
    if (!iFrameDiv)
      iFrameDiv = document.getElementById(iFrameDivID);
    
    try {
      iFrameDiv.style.position = "absolute";
      iFrameDiv.style.width = pickerDiv.offsetWidth;
      iFrameDiv.style.height = pickerDiv.offsetHeight ;
      iFrameDiv.style.top = pickerDiv.style.top;
      iFrameDiv.style.left = pickerDiv.style.left;
      iFrameDiv.style.zIndex = pickerDiv.style.zIndex - 1;
      iFrameDiv.style.visibility = pickerDiv.style.visibility ;
      iFrameDiv.style.display = pickerDiv.style.display;
    } catch(e) {
    }
 
  } catch (ee) {
  }
 
}
