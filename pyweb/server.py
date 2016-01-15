from BaseHTTPServer import BaseHTTPRequestHandler
from BaseHTTPServer import HTTPServer
import cgi
import urlparse
import sys
sys.path.append('modules/')


class PostHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        #Init an dict
        #fields = {}
        
        # Parse the form data posted
        form = cgi.FieldStorage(
        fp=self.rfile,
        headers=self.headers,
        environ={'REQUEST_METHOD':'POST',
          'CONTENT_TYPE':self.headers['Content-Type'],
        })

        # Begin the response
        self.send_response(200)
        self.end_headers()
        self.wfile.write('Post data:\n')


        # Echo back information about what was posted in the form
        for field in form.keys():
            field_item = form[field]
            # Regular form value
            paras = form[field].value
            self.wfile.write('%s=%s\n' % (field, paras))
            #fields.append(paras)
            
            #example
            #I would define default values here.
            detect_type = "xss_detect"
            specific_para = "id"
            
            if field == "detect_type":
                detect_type = paras
            elif field == "url":
                url = paras
            elif field == "specific_para":
                specific_para = paras
            else:
                pass            
            print "[+]Get parameter:"+paras+"\n"        
        
        

        #Start to switch...
        if detect_type == "file_read":
            from file_read import fuzzer
        elif detect_type == "xss_detect": 
            from xss_detect import fuzzer
            #fuzzer = fuzzer(url)
            #fuzzer.detect()
        elif detect_type == "url_redirect":
            from url_redirect import fuzzer
        elif detect_type == "file_traversal":
            from file_traversal import fuzzer
        #yuequan function
        elif detect_type == "pass_by":
            from pass_by import fuzzer
        #elif detect_type == "":
        else:
            return
        fuzzer = fuzzer(url)
        log_value = fuzzer.detect()
        #if resp:
        #    print "[!]"+detect_type+"Get resp:"+resp+"\n"
        #    f.writelines(resp+'\n')
        #print "[+]"+str(log_value)+"\n"
        if log_value != "Error" and log_value != None:
            f = open("log.txt","a+")
            f.writelines("[+]Test url:"+url+'\n')
            f.writelines("[!]Log value:\n"+log_value)
            f.close()
        else:
            print "[+]Maybe no vulns here!\n"
            #pass
        return

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8776), PostHandler)
    print 'Starting server, use <Ctrl-C> to stop'
    server.serve_forever()
