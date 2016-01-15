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

var result = localStorage.sqliResult.split("|");
var host = localStorage.sqlmapHost;
var port = localStorage.sqlmapPort;
var info = "";
info += '<div class="results preview" style="overflow: auto;">';
info += '<table class="table table-bordered table-condensed table-hover" style="word-break:break-all">';
info += '<tr><td>Taskid</td><td>URL</td><td>Status</td><td>Log</td><td>Result</td></tr>';
window.onload=function(){
    for(i in result){
        if(result[i]!=result[0]){
            info+="<tr>";
            info+="<td style='width:140px;'>"+result[i].split(',')[0]+"</td>";
            info+="<td style='word-wrap:break-word;' class='"+result[i].split(',')[0]+"'>"+result[i].split(',')[1]+"</td>";
            info+="<td style='width:80px;' class='"+result[i].split(',')[0]+"'>None</td>";
            info+="<td style='width:50px;'><a target='_Blank' href="+host+':'+port+'/scan/'+result[i].split(',')[0]+'/log'+">View</a></td>";
            info+="<td style='width:60px;'><a target='_Blank' href="+host+':'+port+'/scan/'+result[i].split(',')[0]+'/data'+">View</a></td>";
            info+="</tr>";
            sync(result[i].split(',')[0],host+":"+port+"/scan/"+result[i].split(',')[0])
        }
    }
    $("#display").empty().html(info);
}

function sync(taskid,url){
    SendSqli('GET',url+"/status",'',function(callback){
        document.getElementsByClassName(taskid)[1].innerHTML=JSON.parse(callback).status;
        if(JSON.parse(callback).status=="terminated"){
            SendSqli('GET',url+"/data",'',function(res){
                if(JSON.parse(res).data.length){
                    document.getElementsByClassName(taskid)[0].style.color='red';
                }
            })
        }
    })
}

$('#clear').on('click',function(){
    localStorage.sqliResult="";
    alert('Clear Success');
    location.reload();
})