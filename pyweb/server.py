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

            #detect_type = "xss_detect"
            specific_para = ""
            
            if field == "detect_type":
                detect_type = paras
                print "[+]Get detect_type:"+paras+"\n"  
            elif field == "url":
                url = paras
                print "[+]Get url:"+paras+"\n"
            elif field == "specific_para" and paras != None:
                specific_para = str(paras)
                print "[+]Get specific_para:"+paras+"\n"
            elif field == "cookie":
                print "[+]Get cookie:"+paras+"\n"
            else:
                pass            
                  
        
        #if specific_para == None:
        #    specific_para = ""
        from vuln_detect import fuzzer
        
        try:
            #print specific_para
            fuzzer = fuzzer(url,detect_type,specific_para)
            log_value = fuzzer.detect()
            print "======================================="
        except Exception,e:
            print e


        #return

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8776), PostHandler)
    print """
  ___ ___          ______            _______
 |   Y   |        |   _  \          |   _   |
 |.  |   |        |.  |   \         |.  1   |
 |.  |   | ______ |.  |    \ ______ |.  ____|
 |:  1   ||______||:  1    /|______||:  |
  \:.. ./         |::.. . /         |::.|
   `---'          `------'          `---'
   [+.........Vuln_Detect_Proxy.........+]
   [+...................................+]
"""
    print 'Starting vuln_detect server, use <Ctrl-C> to stop'
    server.serve_forever()
