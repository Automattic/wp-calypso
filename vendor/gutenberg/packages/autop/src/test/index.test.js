/**
 * Internal dependencies
 */
import {
	autop,
} from '../';

test( 'empty string', () => {
	expect( autop( '' ) ).toBe( '' );
} );

test( 'first post', () => {
	const expected = `<p>Welcome to WordPress!  This post contains important information.  After you read it, you can make it private to hide it from visitors but still have the information handy for future reference.</p>
<p>First things first:</p>
<ul>
<li><a href="%1$s" title="Subscribe to the WordPress mailing list for Release Notifications">Subscribe to the WordPress mailing list for release notifications</a></li>
</ul>
<p>As a subscriber, you will receive an email every time an update is available (and only then).  This will make it easier to keep your site up to date, and secure from evildoers.<br />
When a new version is released, <a href="%2$s" title="If you are already logged in, this will take you directly to the Dashboard">log in to the Dashboard</a> and follow the instructions.<br />
Upgrading is a couple of clicks!</p>
<p>Then you can start enjoying the WordPress experience:</p>
<ul>
<li>Edit your personal information at <a href="%3$s" title="Edit settings like your password, your display name and your contact information">Users &#8250; Your Profile</a></li>
<li>Start publishing at <a href="%4$s" title="Create a new post">Posts &#8250; Add New</a> and at <a href="%5$s" title="Create a new page">Pages &#8250; Add New</a></li>
<li>Browse and install plugins at <a href="%6$s" title="Browse and install plugins at the official WordPress repository directly from your Dashboard">Plugins &#8250; Add New</a></li>
<li>Browse and install themes at <a href="%7$s" title="Browse and install themes at the official WordPress repository directly from your Dashboard">Appearance &#8250; Add New Themes</a></li>
<li>Modify and prettify your website&#8217;s links at <a href="%8$s" title="For example, select a link structure like: http://example.com/1999/12/post-name">Settings &#8250; Permalinks</a></li>
<li>Import content from another system or WordPress site at <a href="%9$s" title="WordPress comes with importers for the most common publishing systems">Tools &#8250; Import</a></li>
<li>Find answers to your questions at the <a href="%10$s" title="The official WordPress documentation, maintained by the WordPress community">WordPress Codex</a></li>
</ul>
<p>To keep this post for reference, <a href="%11$s" title="Click to edit the content and settings of this post">click to edit it</a>, go to the Publish box and change its Visibility from Public to Private.</p>
<p>Thank you for selecting WordPress.  We wish you happy publishing!</p>
<p>PS.  Not yet subscribed for update notifications?  <a href="%1$s" title="Subscribe to the WordPress mailing list for Release Notifications">Do it now!</a></p>
`;
	const testData = `Welcome to WordPress!  This post contains important information.  After you read it, you can make it private to hide it from visitors but still have the information handy for future reference.

First things first:
<ul>
<li><a href="%1$s" title="Subscribe to the WordPress mailing list for Release Notifications">Subscribe to the WordPress mailing list for release notifications</a></li>
</ul>
As a subscriber, you will receive an email every time an update is available (and only then).  This will make it easier to keep your site up to date, and secure from evildoers.
When a new version is released, <a href="%2$s" title="If you are already logged in, this will take you directly to the Dashboard">log in to the Dashboard</a> and follow the instructions.
Upgrading is a couple of clicks!

Then you can start enjoying the WordPress experience:
<ul>
<li>Edit your personal information at <a href="%3$s" title="Edit settings like your password, your display name and your contact information">Users &#8250; Your Profile</a></li>
<li>Start publishing at <a href="%4$s" title="Create a new post">Posts &#8250; Add New</a> and at <a href="%5$s" title="Create a new page">Pages &#8250; Add New</a></li>
<li>Browse and install plugins at <a href="%6$s" title="Browse and install plugins at the official WordPress repository directly from your Dashboard">Plugins &#8250; Add New</a></li>
<li>Browse and install themes at <a href="%7$s" title="Browse and install themes at the official WordPress repository directly from your Dashboard">Appearance &#8250; Add New Themes</a></li>
<li>Modify and prettify your website&#8217;s links at <a href="%8$s" title="For example, select a link structure like: http://example.com/1999/12/post-name">Settings &#8250; Permalinks</a></li>
<li>Import content from another system or WordPress site at <a href="%9$s" title="WordPress comes with importers for the most common publishing systems">Tools &#8250; Import</a></li>
<li>Find answers to your questions at the <a href="%10$s" title="The official WordPress documentation, maintained by the WordPress community">WordPress Codex</a></li>
</ul>
To keep this post for reference, <a href="%11$s" title="Click to edit the content and settings of this post">click to edit it</a>, go to the Publish box and change its Visibility from Public to Private.

Thank you for selecting WordPress.  We wish you happy publishing!

PS.  Not yet subscribed for update notifications?  <a href="%1$s" title="Subscribe to the WordPress mailing list for Release Notifications">Do it now!</a>
`;

	expect( autop( testData ) ).toBe( expected );
} );

test( 'skip pre elements', () => {
	const code = `(function(){

done = 0;
});`;

	// Not wrapped in <p> tags
	let str = `<pre>${ code }</pre>`;
	expect( autop( str ).trim() ).toBe( str );

	// Text before/after is wrapped in <p> tags
	str = `Look at this code\n\n<pre>${ code }</pre>\n\nIsn't that cool?`;

	// Expected text after autop
	let expected = '<p>Look at this code</p>\n<pre>' + code + '</pre>\n<p>Isn\'t that cool?</p>';
	expect( autop( str ).trim() ).toBe( expected );

	// Make sure HTML breaks are maintained if manually inserted
	str = 'Look at this code\n\n<pre>Line1<br />Line2<br>Line3<br/>Line4\nActual Line 2\nActual Line 3</pre>\n\nCool, huh?';
	expected = '<p>Look at this code</p>\n<pre>Line1<br />Line2<br>Line3<br/>Line4\nActual Line 2\nActual Line 3</pre>\n<p>Cool, huh?</p>';
	expect( autop( str ).trim() ).toBe( expected );
} );

test( 'skip input elements', () => {
	const str = 'Username: <input type="text" id="username" name="username" /><br />Password: <input type="password" id="password1" name="password1" />';
	expect( autop( str ).trim() ).toBe( '<p>' + str + '</p>' );
} );

test( 'source_track_elements', () => {
	const content = `Paragraph one.

<video class="wp-video-shortcode" id="video-0-1" width="640" height="360" preload="metadata" controls="controls">
	<source type="video/mp4" src="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4" />
	<!-- WebM/VP8 for Firefox4, Opera, and Chrome -->
	<source type="video/webm" src="myvideo.webm" />
	<!-- Ogg/Vorbis for older Firefox and Opera versions -->
	<source type="video/ogg" src="myvideo.ogv" />
	<!-- Optional: Add subtitles for each language -->
	<track kind="subtitles" src="subtitles.srt" srclang="en" />
	<!-- Optional: Add chapters -->
	<track kind="chapters" src="chapters.srt" srclang="en" />
	<a href="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4">http://domain.tld/wp-content/uploads/2013/12/xyz.mp4</a>
</video>

Paragraph two.`;

	const content2 = `Paragraph one.

<video class="wp-video-shortcode" id="video-0-1" width="640" height="360" preload="metadata" controls="controls">

<source type="video/mp4" src="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4" />

<!-- WebM/VP8 for Firefox4, Opera, and Chrome -->
<source type="video/webm" src="myvideo.webm" />

<!-- Ogg/Vorbis for older Firefox and Opera versions -->
<source type="video/ogg" src="myvideo.ogv" />

<!-- Optional: Add subtitles for each language -->
<track kind="subtitles" src="subtitles.srt" srclang="en" />

<!-- Optional: Add chapters -->
<track kind="chapters" src="chapters.srt" srclang="en" />

<a href="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4">http://domain.tld/wp-content/uploads/2013/12/xyz.mp4</a>

</video>

Paragraph two.`;

	const expected = '<p>Paragraph one.</p>\n' + // line breaks only after <p>
		'<p><video class="wp-video-shortcode" id="video-0-1" width="640" height="360" preload="metadata" controls="controls">' +
		'<source type="video/mp4" src="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4" />' +
		'<!-- WebM/VP8 for Firefox4, Opera, and Chrome -->' +
		'<source type="video/webm" src="myvideo.webm" />' +
		'<!-- Ogg/Vorbis for older Firefox and Opera versions -->' +
		'<source type="video/ogg" src="myvideo.ogv" />' +
		'<!-- Optional: Add subtitles for each language -->' +
		'<track kind="subtitles" src="subtitles.srt" srclang="en" />' +
		'<!-- Optional: Add chapters -->' +
		'<track kind="chapters" src="chapters.srt" srclang="en" />' +
		'<a href="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4">' +
		'http://domain.tld/wp-content/uploads/2013/12/xyz.mp4</a></video></p>\n' +
		'<p>Paragraph two.</p>';

	// When running the content through autop() from wp_richedit_pre()
	const shortcodeContent = `Paragraph one.

[video width="720" height="480" mp4="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4"]
<!-- WebM/VP8 for Firefox4, Opera, and Chrome -->
<source type="video/webm" src="myvideo.webm" />
<!-- Ogg/Vorbis for older Firefox and Opera versions -->
<source type="video/ogg" src="myvideo.ogv" />
<!-- Optional: Add subtitles for each language -->
<track kind="subtitles" src="subtitles.srt" srclang="en" />
<!-- Optional: Add chapters -->
<track kind="chapters" src="chapters.srt" srclang="en" />
[/video]

Paragraph two.`;

	const shortcodeExpected = '<p>Paragraph one.</p>\n' + // line breaks only after <p>
		'<p>[video width="720" height="480" mp4="http://domain.tld/wp-content/uploads/2013/12/xyz.mp4"]' +
		'<!-- WebM/VP8 for Firefox4, Opera, and Chrome --><source type="video/webm" src="myvideo.webm" />' +
		'<!-- Ogg/Vorbis for older Firefox and Opera versions --><source type="video/ogg" src="myvideo.ogv" />' +
		'<!-- Optional: Add subtitles for each language --><track kind="subtitles" src="subtitles.srt" srclang="en" />' +
		'<!-- Optional: Add chapters --><track kind="chapters" src="chapters.srt" srclang="en" />' +
		'[/video]</p>\n' +
		'<p>Paragraph two.</p>';

	expect( autop( content ).trim() ).toBe( expected );
	expect( autop( content2 ).trim() ).toBe( expected );
	expect( autop( shortcodeContent ).trim() ).toBe( shortcodeExpected );
} );

test( 'param embed elements', () => {
	const content1 = `Paragraph one.

<object width="400" height="224" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">
	<param name="src" value="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" />
	<param name="allowfullscreen" value="true" />
	<param name="allowscriptaccess" value="always" />
	<param name="overstretch" value="true" />
	<param name="flashvars" value="isDynamicSeeking=true" />

	<embed width="400" height="224" type="application/x-shockwave-flash" src="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" wmode="direct" seamlesstabbing="true" allowfullscreen="true" overstretch="true" flashvars="isDynamicSeeking=true" />
</object>

Paragraph two.`;

	const expected1 = '<p>Paragraph one.</p>\n' + // line breaks only after <p>
		'<p><object width="400" height="224" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0">' +
		'<param name="src" value="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" />' +
		'<param name="allowfullscreen" value="true" />' +
		'<param name="allowscriptaccess" value="always" />' +
		'<param name="overstretch" value="true" />' +
		'<param name="flashvars" value="isDynamicSeeking=true" />' +
		'<embed width="400" height="224" type="application/x-shockwave-flash" src="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" wmode="direct" seamlesstabbing="true" allowfullscreen="true" overstretch="true" flashvars="isDynamicSeeking=true" />' +
		'</object></p>\n' +
		'<p>Paragraph two.</p>';

	const content2 = `Paragraph one.

<div class="video-player" id="x-video-0">
<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="640" height="360" id="video-0" standby="Standby text">
<param name="movie" value="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" />
<param name="quality" value="best" />

<param name="seamlesstabbing" value="true" />
<param name="allowfullscreen" value="true" />
<param name="allowscriptaccess" value="always" />
<param name="overstretch" value="true" />

<!--[if !IE]--><object type="application/x-shockwave-flash" data="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" width="640" height="360" standby="Standby text">
<param name="quality" value="best" />

<param name="seamlesstabbing" value="true" />
<param name="allowfullscreen" value="true" />
<param name="allowscriptaccess" value="always" />
<param name="overstretch" value="true" />
</object><!--<![endif]-->
</object></div>

Paragraph two.`;

	const expected2 = '<p>Paragraph one.</p>\n' + // line breaks only after block tags
		'<div class="video-player" id="x-video-0">\n' +
		'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="640" height="360" id="video-0" standby="Standby text">' +
		'<param name="movie" value="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" />' +
		'<param name="quality" value="best" />' +
		'<param name="seamlesstabbing" value="true" />' +
		'<param name="allowfullscreen" value="true" />' +
		'<param name="allowscriptaccess" value="always" />' +
		'<param name="overstretch" value="true" />' +
		'<!--[if !IE]--><object type="application/x-shockwave-flash" data="http://domain.tld/wp-content/uploads/2013/12/xyz.swf" width="640" height="360" standby="Standby text">' +
		'<param name="quality" value="best" />' +
		'<param name="seamlesstabbing" value="true" />' +
		'<param name="allowfullscreen" value="true" />' +
		'<param name="allowscriptaccess" value="always" />' +
		'<param name="overstretch" value="true" /></object><!--<![endif]-->' +
		'</object></div>\n' +
		'<p>Paragraph two.</p>';

	expect( autop( content1 ).trim() ).toBe( expected1 );
	expect( autop( content2 ).trim() ).toBe( expected2 );
} );

test( 'skip select option elements', () => {
	const str = 'Country: <select id="state" name="state"><option value="1">Alabama</option><option value="2">Alaska</option><option value="3">Arizona</option><option value="4">Arkansas</option><option value="5">California</option></select>';

	expect( autop( str ).trim() ).toBe( '<p>' + str + '</p>' );
} );

test( 'that_autop_treats_block_level_elements_as_blocks', () => {
	const blocks = [
		'table',
		'thead',
		'tfoot',
		'caption',
		'col',
		'colgroup',
		'tbody',
		'tr',
		'td',
		'th',
		'div',
		'dl',
		'dd',
		'dt',
		'ul',
		'ol',
		'li',
		'pre',
		'form',
		'map',
		'area',
		'address',
		'math',
		'style',
		'p',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'hr',
		'fieldset',
		'legend',
		'section',
		'article',
		'aside',
		'hgroup',
		'header',
		'footer',
		'nav',
		'figure',
		'details',
		'menu',
		'summary',
	];

	// Check whitespace normalization.
	let content = [];

	blocks.forEach( ( block ) => {
		content.push( `<${ block }>foo</${ block }>` );
	} );

	let expected = content.join( '\n' );
	let input = content.join( '\n\n' ); // WS difference

	expect( autop( input ).trim() ).toBe( expected );

	input = content.join( '' ); // WS difference

	expect( autop( input ).trim() ).toBe( expected );

	// Check whitespace addition.
	content = [];

	blocks.forEach( ( block ) => {
		content.push( `<${ block }/>` );
	} );

	expected = content.join( '\n' );
	input = content.join( '' );

	expect( autop( input ).trim() ).toBe( expected );

	// Check whitespace addition with attributes.
	content = [];

	blocks.forEach( ( block ) => {
		content.push( `<${ block } attr='value'>foo</${ block }>` );
	} );

	expected = content.join( '\n' );
	input = content.join( '' );

	expect( autop( input ).trim() ).toBe( expected );
} );

test( 'autop does not wrap blockquotes but does autop their contents', () => {
	const content = '<blockquote>foo</blockquote>';
	const expected = '<blockquote><p>foo</p></blockquote>';

	expect( autop( content ).trim() ).toBe( expected );
} );

test( 'that autop treats inline elements as inline', () => {
	const inlines = [
		'a',
		'em',
		'strong',
		'small',
		's',
		'cite',
		'q',
		'dfn',
		'abbr',
		'data',
		'time',
		'code',
		'var',
		'samp',
		'kbd',
		'sub',
		'sup',
		'i',
		'b',
		'u',
		'mark',
		'span',
		'del',
		'ins',
		'noscript',
		'select',
	];

	let content = [];
	let expected = [];

	inlines.forEach( ( inline ) => {
		content.push( `<${ inline }>foo</${ inline }>` );
		expected.push( `<p><${ inline }>foo</${ inline }></p>` );
	} );

	content = content.join( '\n\n' );
	expected = expected.join( '\n' );

	expect( autop( content ).trim() ).toBe( expected );
} );

test( 'element sanity', () => {
	[
		[
			'Hello <a\nhref="world">',
			'<p>Hello <a\nhref="world"></p>\n',
		],
		[
			'Hello <!-- a\nhref="world" -->',
			'<p>Hello <!-- a\nhref="world" --></p>\n',
		],
		[
			'Hello <!-- <object>\n<param>\n<param>\n<embed>\n</embed>\n</object>\n -->',
			'<p>Hello <!-- <object>\n<param>\n<param>\n<embed>\n</embed>\n</object>\n --></p>\n',
		],
		[
			'Hello <!-- <object>\n<param/>\n<param/>\n<embed>\n</embed>\n</object>\n -->',
			'<p>Hello <!-- <object>\n<param/>\n<param/>\n<embed>\n</embed>\n</object>\n --></p>\n',
		],
		/* Block elements inside comments will fail this test in all versions, it's not a regression.
		[
			'Hello <!-- <hr> a\nhref='world' -->',
			'<p>Hello <!-- <hr> a\nhref='world' --></p>\n',
		],
		[
			'Hello <![CDATA[ <hr> a\nhttps://youtu.be/jgz0uSaOZbE\n ]]>',
			'<p>Hello <![CDATA[ <hr> a\nhttps://youtu.be/jgz0uSaOZbE\n ]]></p>\n',
		],
		*/
		[
			'Hello <![CDATA[ a\nhttps://youtu.be/jgz0uSaOZbE\n ]]>',
			'<p>Hello <![CDATA[ a\nhttps://youtu.be/jgz0uSaOZbE\n ]]></p>\n',
		],
		[
			'Hello <![CDATA[ <!-- a\nhttps://youtu.be/jgz0uSaOZbE\n a\n9 ]]> -->',
			'<p>Hello <![CDATA[ <!-- a\nhttps://youtu.be/jgz0uSaOZbE\n a\n9 ]]> --></p>\n',
		],
		[
			'Hello <![CDATA[ <!-- a\nhttps://youtu.be/jgz0uSaOZbE\n a\n9 --> a\n9 ]]>',
			'<p>Hello <![CDATA[ <!-- a\nhttps://youtu.be/jgz0uSaOZbE\n a\n9 --> a\n9 ]]></p>\n',
		],
	].forEach( ( [ input, output ] ) => {
		expect( autop( input ) ).toBe( output );
	} );
} );

test( 'that autop skips line breaks after br', () => {
	const content = `
line 1<br>
line 2<br/>
line 3<br />
line 4
line 5
`;

	const expected = `<p>line 1<br />
line 2<br />
line 3<br />
line 4<br />
line 5</p>`;

	expect( autop( content ).trim() ).toBe( expected );
} );

test( 'that autop adds a paragraph after multiple br', () => {
	const content = `
line 1<br>
<br/>
line 2<br/>
<br />
`;

	const expected = `<p>line 1</p>
<p>line 2</p>`;

	expect( autop( content ).trim() ).toBe( expected );
} );

test( 'that text before blocks is peed', () => {
	const content = 'a<div>b</div>';
	const expected = '<p>a</p>\n<div>b</div>';

	expect( autop( content ).trim() ).toBe( expected );
} );

test( 'that autop doses not add extra closing p in figure', () => {
	const content1 = '<figure><img src="example.jpg" /><figcaption>Caption</figcaption></figure>';
	const expected1 = content1;

	const content2 = `<figure>
<img src="example.jpg" />
<figcaption>Caption</figcaption>
</figure>`;

	const expected2 = `<figure>
<img src="example.jpg" /><figcaption>Caption</figcaption></figure>`;

	expect( autop( content1 ).trim() ).toBe( expected1 );
	expect( autop( content2 ).trim() ).toBe( expected2 );
} );
