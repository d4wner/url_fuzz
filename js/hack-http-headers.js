var filter = {
    urls: ["<all_urls>"],
    types: [ "main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
};
var captured = 1;
var ascending = 1;
var request_id = 0;
var headerInfo = {};
var settings = {};
var defaultText = "";
var selectedRequestId = 0;
var tempModifyRequest = {};
var tempFilterUrls = [];
var filterUrlsEternal = [];

function getClassStyle(statusCode) {
    if(statusCode >= 100 && statusCode < 200)
    {
        return "info";
    }
    else if(statusCode >= 200 &&statusCode < 300)
    {
        return "success";
    }
    else if(statusCode >= 300 && statusCode < 400)
    {
        return "danger";
    }
    else if(statusCode >= 400 && statusCode < 500)
    {
        return "error";
    }
    else if(statusCode >= 500 && statusCode < 600)
    {
        return "warning";
    }
    else
    {
        return "error";
    }
}

function captureType(type) {
    switch (type)
    {
        case "main_frame":
            return settings.cap_MainFrame;
        case "sub_frame":
            return settings.cap_SubFrame;
        case "stylesheet":
            return settings.cap_Stylesheet;
        case "script":
            return settings.cap_Script;
        case "image":
            return settings.cap_Image;
        case "object":
            return settings.cap_Object;
        case "xmlhttprequest":
            return settings.cap_Xmlhttprequest;
        case "other":
            return settings.cap_other;
    }
    return 0;
}

function captureUrl(reqUrl) {
    if(filterUrlsEternal.length == 0){
        return 1;
    } else {
        for (var i=0; i < filterUrlsEternal.length; i++) {
            if (reqUrl.indexOf(filterUrlsEternal[i]) >= 0) {
                return 1;
            }
        }
        return 0;
    }
}

function getResponseId(reqId){
    var chromeRequestId = headerInfo.request[reqId].requestId;
    var resId = 0;
    for(var i=0; i < headerInfo.response.length; i++)
    {
        if(headerInfo.response[i].requestId == chromeRequestId)
        {
            resId = i;
            break;
        }
    }
    return resId;
}

function showHeader(reqId) {
    var resId = getResponseId(reqId);
    var statusLine = headerInfo.response[resId].statusLine.split(" ");
    var showurl = headerInfo.request[reqId].url.toLocaleLowerCase();
    var regex = /(\.gif|\.jpg|\.jpeg|\.png|\.css|\.svg|\.ico|\&chongfu=true)/;
    if(showurl.indexOf(localStorage.sqlmapHost)<0){
        if(regex.exec(showurl)){

        }
        else{
            var info = "";
            info += "<tr>";
            info += '<td class="rId">' + reqId + "<\/td>";
            info += '<td class="rMe">' + headerInfo.request[reqId].method + "<\/td>";
            info += '<td class="rSt ' + getClassStyle(statusLine[1]) + '">' + statusLine[1] + "<\/td>";

            for(var i in headerInfo.response[resId].responseHeaders){
                if(headerInfo.response[resId].responseHeaders[i].name=="Content-Type"){
                    if(headerInfo.response[resId].responseHeaders[i].value.indexOf('text/json')>=0){
                        info += '<td class="rUr"><input type="text" style="color:indianred" class="inputUrl form-control" value="' + headerInfo.request[reqId].url + '" /><\/td>';
                        break;
                    }
                    else if(headerInfo.response[resId].responseHeaders[i].value.indexOf('text/html')>=0){
                        info += '<td class="rUr"><input type="text" style="color:blue" class="inputUrl form-control" value="' + headerInfo.request[reqId].url + '" /><\/td>';
                        break;
                    }
                    else if(headerInfo.response[resId].responseHeaders[i].value.indexOf('application/x-javascript')>=0){
                        info += '<td class="rUr"><input type="text" style="color:#67b168" class="inputUrl form-control" value="' + headerInfo.request[reqId].url + '" /><\/td>';
                        break;
                    }
                    else if(headerInfo.response[resId].responseHeaders[i].value.indexOf('application/x-shockwave-flash')>=0){
                        info += '<td class="rUr"><input type="text" style="color:darkred" class="inputUrl form-control" value="' + headerInfo.request[reqId].url + '" /><\/td>';
                        break;
                    }
                    else{
                        info += '<td class="rUr"><input type="text" class="inputUrl form-control" value="' + headerInfo.request[reqId].url + '" /><\/td>';
                        break;
                    }
                }

                if(headerInfo.response[resId].responseHeaders[i].name==headerInfo.response[resId].responseHeaders[headerInfo.response[resId].responseHeaders.length-1].name&&headerInfo.response[resId].responseHeaders[i].name!="Content-Type"){
                        info += '<td class="rUr"><input type="text" class="inputUrl form-control" value="' + headerInfo.request[reqId].url + '" /><\/td>';
                        break;
                }
            }

            info += "<\/tr>";
            if (ascending == 1) {
                $("#responseList > tbody:last").append(info);
            } else {
                $("#responseList > tbody:first").prepend(info);
            }
        }
    }

}

function reloadHttpHeadersTable(urlPattern) {
    $("#responseList > tbody").empty();
    $("#previewArea").empty().html();
    for(var i=0; i < headerInfo.request.length; i++) {
        if(headerInfo.request[i].url.indexOf(urlPattern) >= 0) {
            showHeader(i);
        }
    }
}

function niceRequest(details) {
    var info = "";
    info += '<div class="requestEdit">';
    info += '<table class="table table-bordered table-condensed table-hover" style="word-break:break-all">';
    info += '<tr><th>Method<\/th><td>' + details.method + '<\/td><\/tr>';
    info += '<tr><th>URL<\/th><td>' + details.url + '<\/td><\/tr>';
    for(var i=0; i < details.requestHeaders.length; i++)
    {
        info += "<tr>";
        info += '<th nowrap="nowrap">'+ details.requestHeaders[i].name + '<\/th>';
        info += '<td><div contenteditable="true" class="requestHeaderValue">' + details.requestHeaders[i].value + "<\/div><\/td><\/tr>";
    }
    return info;
}

function Connection(Sendtype,url,callback){
    var xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange=function(){
        if(xmlhttp.readyState==4&&xmlhttp.status==200)
        {
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open(Sendtype,url+"?&chongfu=true",true);
    xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xmlhttp.send();
}
function SendSqli(Sendtype,url,SendContent,callback){
    var xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange=function(){
        if(xmlhttp.readyState==4&&xmlhttp.status==200)
        {
            callback(xmlhttp.responseText);
        }
    }
    xmlhttp.open(Sendtype,url,true);
    xmlhttp.setRequestHeader("Content-Type","application/json");
    xmlhttp.send(SendContent);
}
function SendUrl(Sendtype,url,SendContent){
	var xmlhttp=new XMLHttpRequest();
    xmlhttp.onreadystatechange=function(){
     var xss_detect = true;
	 //alert('Xss_detect has been send...');
    }
	xmlhttp.open(Sendtype,url,true);
    xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xmlhttp.send(SendContent);
	alert('Xss_detect has been send...');
}

function showDetails(reqId) {
    var resId = getResponseId(reqId);
    var responseHeaderLength = headerInfo.response[resId].responseHeaders.length;
    var fieldName = "";
    var fieldValue = "";
    var statusLine = headerInfo.response[resId].statusLine.split(" ");
    var info ="";
    info += '<div class="results preview" style="overflow: auto;">';
    info += '<table class="table table-bordered table-condensed table-hover" style="word-break:break-all">';
    info += '<tr class="'+getClassStyle(statusLine[1])+'">';
    info += '<td colspan="2">';
    info += "<b>" + headerInfo.request[reqId].method + "<\/b> " + "<a target='_Blank' href="+headerInfo.request[reqId].url + ">"+headerInfo.request[reqId].url+"</a><br />";
    info += "<b>Status:<\/b> " + headerInfo.response[resId].statusLine;
    info += "<\/td><\/tr>";
    info += '<tr class="warning"><td colspan="2"><b>Check Url :  '+headerInfo.request[reqId].url+'<\/b>  <\/td><\/tr>';
	
	info +='<tr class="warning"><td colspan="2"><b> <input value="CheckSqli" id="check" type="button">&nbsp;&nbsp;<input value="CheckVulns" id="checkvulns" type="button"><\/b>&nbsp;<=SpecificPara=><input type="text" id="specific_para" name="specific_para" /><\/b><\/td><\/tr>';
	
	info += '<tr class="warning"><td colspan="2"><b>Detect type:  <\/b><input type="radio" id="xss_detect" name="detect_type" value="xss_detect" checked = checked/>xss_detect<\/b>&nbsp;<input type="radio" id="url_redirect" name="detect_type" value="url_redirect" />url_redirect<\/b>&nbsp;<input type="radio" id="file_traversal" name="detect_type" value="file_traversal" />file_traversal<\/b>&nbsp;<input type="radio" id="file_read" name="detect_type" value="file_read" />file_read<\/b>&nbsp;<\/td><\/tr>';
	info += '<tr class="warning"><td colspan="2"><b>Response Headers<\/b><\/td><\/tr>';
    
    for(i = 0; i < responseHeaderLength; i++){
        fieldName = headerInfo.response[resId].responseHeaders[i].name;
        fieldValue = headerInfo.response[resId].responseHeaders[i].value;
        if(fieldName.toLowerCase() === "set-cookie" ) {
            fieldValue = fieldValue.replace(/; /g, ";<br />");
        }
        info += "<tr>";
        info += '<th nowrap="nowrap">' + fieldName + "<\/th>";
        info += "<td>" + fieldValue + "<\/td><\/tr>";
    }
    var req = headerInfo.request[selectedRequestId];
    var UA  = "";
    var CK  = "";
    for(x in req.requestHeaders){
        if(req.requestHeaders[x].name=="User-Agent"){
            UA = req.requestHeaders[x].value;
        }
        else if(req.requestHeaders[x].name=="Cookie"){
            CK = req.requestHeaders[x].value;
        }
    }
    for(i in req.requestHeaders){
        console.log(req.requestHeaders[i]);
    }
    Connection('GET',headerInfo.request[reqId].url,function(callback){
        document.getElementById('response').innerHTML=callback;
    })
    info += '<tr class="warning"><td colspan="2"><b>Response Body<\/b><\/td><\/tr>';
    info += '</table>';
    info += '<textarea id="response" cols="80" rows="17" style="font-family: monospace;"></textarea>';
    info += '</div>';
	

	
    $("#previewArea").empty().html(info);
	
	//var specific_para = document.getElementById('specific_para').value;
	//alert(specific_para);
	//var detect_type = document.getElementById('detect_type').value;
	
	document.getElementById('checkvulns').onclick=function()
	{
		var detect_type = document.getElementsByName('detect_type');
		for(var i=0;i<detect_type.length;i++)
		{
			if(detect_type[i].checked)
			var detect_type_value = detect_type[i].value;
		}
		//var detect_type = document.getElementsByName('detect_type').value;
		var specific_para = document.getElementById('specific_para').value;
		//alert(document.getElementById('specific_para').value);
		//alert(123);
		//alert(specific_para);
		//alert(detect_type_value);
		SendUrl('Post','http://127.0.0.1:8776/server.py','url='+encodeURIComponent(headerInfo.request[reqId].url)+'&specific_para='+specific_para+'&detect_type='+detect_type_value);
	}
	
    document.getElementById('check').onclick=function(){
        SendSqli('GET',localStorage.sqlmapHost+":"+localStorage.sqlmapPort+'/task/new','',function(callback){
            var newResult = JSON.parse(callback);
            if(newResult.success){
                SendSqli('POST',localStorage.sqlmapHost+":"+localStorage.sqlmapPort+'/scan/'+newResult.taskid+'/start','{"url": "'+headerInfo.request[reqId].url+'","cookie":"'+CK+'","User-Agent":"'+UA+'"}',function(callbacktwo){
                    var SendResult = JSON.parse(callbacktwo);
                    if(SendResult.success){
                        alert('engineid:'+SendResult.engineid);
                        localStorage['sqliResult'] = localStorage['sqliResult']+"|"+newResult.taskid+","+headerInfo.request[reqId].url;
                    }
                    else{
                        alert('无法提交给SQLMAP');
                    }
                })
            }
            else{
                alert('创建检测任务失败');
            }
        })
    }
    resizeWindow();
}


function resizeWindow() {
    $(".results").css("height", "0px");
    $(".preview").css("width", "0px");
    $("#mainTable").height($(window).height() - $("#nav").height());
    $(".results").css("height", $("#mainTable td").css("height"));
    $(".preview").css("width", $("#previewArea").css("width"));
}

document.addEventListener('DOMContentLoaded', function(){
    headerInfo.request = [];
    headerInfo.response = [];
    headerInfo.modified = [];

    defaultText = $("#previewArea").html();

    chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
        if(captureType(details.type) != 0 && captureUrl(details.url) !=0 && headerInfo.modified.length != 0)
        {
            for(var i=0; i < headerInfo.modified.length; i++)
            {
                if(details.url == headerInfo.modified[i].url)
                {
                    for(var j=0; j < headerInfo.modified[i].requestHeaders.length; j++)
                    for(var k=0; k < details.requestHeaders.length; k++)
                    {
                        if (details.requestHeaders[k].name == headerInfo.modified[i].requestHeaders[j].name) {
                            details.requestHeaders[k].value = headerInfo.modified[i].requestHeaders[j].value;
                        }
                    }
                }
            }
        }

        return {requestHeaders: details.requestHeaders};
    }, filter, ["blocking", "requestHeaders"]);

    chrome.webRequest.onSendHeaders.addListener(function(details){
        if(captureType(details.type) != 0 && captureUrl(details.url) != 0 && captured != 0) {
            headerInfo.request.push(details);
        }
    }, filter, ["requestHeaders"]);

    chrome.webRequest.onHeadersReceived.addListener(function(details){
        if(captureType(details.type) != 0 && captureUrl(details.url) != 0 && captured != 0) {
            headerInfo.response.push(details);
            if(headerInfo.request[request_id].url.indexOf($('#tempUrlFilter').val()) >= 0) {
                showHeader(request_id);
            }
            request_id += 1;
        }
    }, filter, ["blocking", "responseHeaders"]);

    $('#capture').on('click', function(){
        if(captured == 0)
        {
            $('#capture').addClass("active").removeClass("btn-danger").addClass("btn-success");
            $('#capture').children("span").removeClass("glyphicon-ban-circle").addClass("glyphicon-ok");
            captured = 1;
        }
        else
        {
            captured = 0;
            $('#capture').removeClass("active").removeClass("btn-success").addClass("btn-danger");
            $('#capture').children("span").removeClass("glyphicon-ok").addClass("glyphicon-ban-circle");
        }
    });
    $('#edit').on('click', function(){
        tempModifyRequest.requestHeaders = [];
        var request = headerInfo.request[selectedRequestId];
        if(request != undefined) {
            tempModifyRequest.url = request.url;
            $('#editModalBody').html(niceRequest(request));
            $('#editModal').modal("show");
        }
        $(".requestHeaderValue").on("input", function (event) {
            var headerName = $(event.target).closest("tr").children().first("th").html();
            var headerValue = event.target.innerHTML;
            for(var i=0; i < tempModifyRequest.requestHeaders.length; i++)
            {
                if(tempModifyRequest.requestHeaders[i].name == headerName)
                {
                    tempModifyRequest.requestHeaders.splice(i, 1);
                }
            }
            tempModifyRequest.requestHeaders.push({name: headerName, value: headerValue});
        });

    });
    $('#saveEdit').on("click", function () {
        var temp = {};
        $.extend(true, temp, tempModifyRequest);
        headerInfo.modified.push(temp);
        $('#editModal').modal("hide");
    });
    $('#clear').on('click', function() {
        $("#responseList > tbody").empty();
        $("#previewArea").empty().html(defaultText);
    });
    $('#revert').on('click', function(){ headerInfo.modified = []; });

    var capLocalSettings = localStorage.hackhhSettings;
    if(capLocalSettings != undefined)
    {
        settings = JSON.parse(capLocalSettings);
    }
    else
    {
        settings.cap_MainFrame = 1;
        settings.cap_SubFrame = 1;
        settings.cap_Stylesheet = 1;
        settings.cap_Script = 1;
        settings.cap_Image = 1;
        settings.cap_Object = 1;
        settings.cap_Xmlhttprequest = 1;
        settings.cap_other = 1;
        localStorage.hackhhSettings = JSON.stringify(settings);
    }
    var capUrlFilter = localStorage.hackhhUrlFilter;
    if(capUrlFilter != undefined)
    {
        filterUrlsEternal = JSON.parse(capUrlFilter);
    }

    $('#settings').on("click", function(){
        if(localStorage.sqlmapHost&&localStorage.sqlmapPort){
            $('#sqlhost').val(localStorage.sqlmapHost);
            $('#sqlport').val(localStorage.sqlmapPort);
        }
        else{
            $('#sqlhost').val('http://127.0.0.1');
            $('#sqlport').val('8775');
            setTimeout(function(){
                alert('你还没设置api信息,已为您显示默认值,请点击保存');
            },500)
        }
        $("#setMainFrame").prop("checked", settings.cap_MainFrame);
        $("#setSubFrame").prop("checked", settings.cap_SubFrame);
        $("#setStylesheet").prop("checked", settings.cap_Stylesheet);
        $("#setScript").prop("checked", settings.cap_Script);
        $("#setImage").prop("checked", settings.cap_Image);
        $("#setObject").prop("checked", settings.cap_Object);
        $("#setXHR").prop("checked", settings.cap_Xmlhttprequest);
        $("#setOther").prop("checked", settings.cap_other);

        tempFilterUrls = [];
        $.extend(true, tempFilterUrls, filterUrlsEternal);
        var inputGroupLength = $('#urlFilterEternal').children().length;
        var oldDev = $('#urlFilterEternal').children().eq(inputGroupLength-1);
        for(var i=0; i < inputGroupLength - 1; i++){
            $('#urlFilterEternal').children().eq(0).remove();
        }
        for (i = 0; i < tempFilterUrls.length; i++) {
            var newDev = oldDev.clone(true);
            newDev.find("input").val(tempFilterUrls[i]);
            oldDev.before(newDev);
            newDev.find("button").addClass('btn-danger').removeClass('addUrlFilterEternal').addClass('delUrlFilterEternal').text('-');
            newDev.find('button').off('click').on('click', function () {
                var delFilterUrl = $(this).parent().parent().children('input').val();
                if (delFilterUrl == '') {
                    return;
                } else {
                    for (var i = 0; i < tempFilterUrls.length; i++) {
                        if (tempFilterUrls[i] == delFilterUrl) {
                            tempFilterUrls.splice(i, 1);
                        }
                    }
                }
                $(this).parent().parent().parent().remove();
            });
        }
        $('#settingModal').modal("show");
    });

    $('.addUrlFilterEternal').on('click', function(){
        var addFilterUrl = $(event.target).parent().parent().children('input').val();
        if(addFilterUrl == ''){
            return;
        }else {
            for(var i=0; i < tempFilterUrls.length; i++){
                if(tempFilterUrls[i] == addFilterUrl){
                    tempFilterUrls.splice(i, 1);
                }
            }
            tempFilterUrls.push(addFilterUrl);
        }
        var oldDev = $(event.target).parent().parent().parent();
        var newDev = oldDev.clone(true);
        newDev.find("input").val('');
        oldDev.after(newDev);
        $(event.target).addClass('btn-danger').removeClass('addUrlFilterEternal').addClass('delUrlFilterEternal').text('-');
        $(event.target).off('click').on('click', function(){
            var delFilterUrl = $(event.target).parent().parent().children('input').val();
            if(delFilterUrl == ''){
                return;
            }else {
                for(var i=0; i < tempFilterUrls.length; i++){
                    if(tempFilterUrls[i] == delFilterUrl){
                        tempFilterUrls.splice(i, 1);
                    }
                }
            }
            $(event.target).parent().parent().parent().remove();
        });
    });

    $("#saveSettings").on("click", function () {
        settings.cap_MainFrame = $("#setMainFrame").prop("checked");
        settings.cap_SubFrame = $("#setSubFrame").prop("checked");
        settings.cap_Stylesheet = $("#setStylesheet").prop("checked");
        settings.cap_Script = $("#setScript").prop("checked");
        settings.cap_Image = $("#setImage").prop("checked");
        settings.cap_Object = $("#setObject").prop("checked");
        settings.cap_Xmlhttprequest = $("#setXHR").prop("checked");
        settings.cap_other = $("#setOther").prop("checked");
        localStorage.hackhhSettings = JSON.stringify(settings);
        filterUrlsEternal=[];
        $.extend(true, filterUrlsEternal, tempFilterUrls);
        localStorage.hackhhUrlFilter = JSON.stringify(filterUrlsEternal);
        localStorage.sqlmapHost = $('#sqlhost')[0].value;
        localStorage.sqlmapPort = $('#sqlport')[0].value;
        $('#settingModal').modal("hide");
    });
    $('#result').on("click",function(){
        window.open("sqli.html");
    })
    $("#responseList").click(function(e){
        var elemName = e.toElement.nodeName.toLowerCase();
        if (elemName == "td" || elemName == "input" || elemName == "span"){
            var id = $(e.toElement).closest("tr").children().first("td").html();
            $(e.toElement).closest("tr").children("td").children("input").select();
            selectedRequestId = id;
            showDetails(id);
        }
    });
    $("#httpFieldValue").focus();
    $('#tempUrlFilter').on('input', function(){
        reloadHttpHeadersTable($(event.target).val());
    });

    $('#httpRequestId').on('click', function(){
        if(ascending == 1){
            $('#httpRequestId').children("span").removeClass("glyphicon-arrow-up").addClass("glyphicon-arrow-down");
            ascending = 0;
        }else {
            $('#httpRequestId').children("span").removeClass("glyphicon-arrow-down").addClass("glyphicon-arrow-up");
            ascending = 1;
        }
        reloadHttpHeadersTable($('#tempUrlFilter').val());
    });
});
