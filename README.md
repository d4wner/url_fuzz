# url_fuzz
This is an fuzzer for urls，parse urls and then find vulns for url.
PS:
The functions may be simple and modularized, the feature will be easy for other script to callback.
Well, I provide some interfaces here, you can use them individually.

Main functions:
1.Provide interfaces for other proxies.
2.Xss_fuzzer
3.File traversal fuzzer
4.File read fuzzer
5.Waf fuzzer
6.Url redirect fuzzer

#update 2016.01.15
1.add hack-http-header api
2.modify hack-http-headers.js
3.thx the origin author of hack-http-header:0xjin

#update 2016.01.21
1.correct some bugs
2.add pass by module
3.all modules in a file
4.waf fuzzer will come later

#update 2016.01.23
1.add waf detect

#upadte 2016.03.07
1.ready to use demo.
2.pyweb/server.py as background runing...
3.pyburp/pentest_api.py as burp_extender..
4.pyweb/log.txt will log what you successed...
4.you can check:
---------------
-xss_detect
-url_redirect
-file_download
-file_read
-pass_by(Unauthorized attack)
---------------
5.Dears,please feedback for me...
