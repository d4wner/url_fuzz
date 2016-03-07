from burp import IBurpExtender
from burp import IContextMenuFactory
from burp import IBurpExtenderCallbacks
from burp import IContextMenuInvocation
from burp import IHttpRequestResponse
from burp import ITextEditor
from javax.swing import JMenuItem
import subprocess

pythonfile = "C:\\Python27\\python.exe"

sqlmapapi = "D:\\tools\\sqlmapproject-sqlmap-b5b3411\\sqlmap.py"

class BurpExtender(IBurpExtender, IContextMenuFactory, ITextEditor):
	
	def registerExtenderCallbacks(self, callbacks):
		self._actionName = "Sqlmap Scan"
		self._helers = callbacks.getHelpers()
		self._callbacks = callbacks
                self._helper = callbacks.getHelpers()
		callbacks.setExtensionName("Sqlmap Scan")
		callbacks.registerContextMenuFactory(self)
		return 

	def createMenuItems(self, invocation):
		menu = []
		responses = invocation.getSelectedMessages()
		if len(responses) == 1:
			menu.append(JMenuItem(self._actionName, None , actionPerformed= lambda x, inv=invocation: self.sqlMapScan(inv)))
			return menu
		return None

	def sqlMapScan(self, invocation):
            start, end = invocation.getSelectionBounds()
            message = invocation.getSelectedMessages()[0].getRequest()
            selected_text = self._helper.bytesToString(message)[start:end]
            print selected_text
