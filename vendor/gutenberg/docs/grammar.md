
# The Gutenberg block grammar

<style>
	dl { display: flex; flex-wrap: wrap; font-size: 110%; }
	dt, dd { flex: 40%; margin-bottom: 1em; }
	dt { text-align: right; font-style: italic; font-size: 105%; }
	dd header { font-weight: bold; }
	pre { margin: 0; }
</style>
<dl><dt></dt><dd><pre><header>Block_List</header>  = $(!Block .)* (Block $(!Block .)*)* $(.*)</pre></dd><dt></dt><dd><pre><header>Block</header>  = Block_Void
  / Block_Balanced</pre></dd><dt></dt><dd><pre><header>Block_Void</header>  = "&lt;!--" __ "wp:" Block_Name __ (Block_Attributes __)? "/-->"</pre></dd><dt></dt><dd><pre><header>Block_Balanced</header>  = Block_Start (Block / $(!Block_End .))* Block_End</pre></dd><dt></dt><dd><pre><header>Block_Start</header>  = "&lt;!--" __ "wp:" Block_Name __ (Block_Attributes __)? "-->"</pre></dd><dt></dt><dd><pre><header>Block_End</header>  = "&lt;!--" __ "/wp:" Block_Name __ "-->"</pre></dd><dt></dt><dd><pre><header>Block_Name</header>  = Namespaced_Block_Name
  / Core_Block_Name</pre></dd><dt></dt><dd><pre><header>Namespaced_Block_Name</header>  = $(Block_Name_Part "/" Block_Name_Part)</pre></dd><dt></dt><dd><pre><header>Core_Block_Name</header>  = $(Block_Name_Part)</pre></dd><dt></dt><dd><pre><header>Block_Name_Part</header>  = $([a-z] [a-z0-9_-]*)</pre></dd><dt>JSON-encoded attributes embedded in a block's opening comment</dt><dd><pre><header>Block_Attributes</header>  = $("{" (!("}" __ "" "/"? "-->") .)* "}")</pre></dd><dt></dt><dd><pre><header>__</header>  = [ \t\r\n]+</pre></dd></dl>
