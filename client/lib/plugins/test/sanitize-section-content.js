/**
 * @format
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { sanitizeSectionContent as clean } from '../sanitize-section-content';

/**
 * Attempts to create a DOM node from given HTML
 *
 * @param {String} html expected HTML to create node
 * @returns {Node | null} possible node described by HTML
 */
const cleanNode = html => {
	const div = document.createElement( 'div' );

	div.innerHTML = clean( html );

	return div.firstChild;
};

test( 'should allow whitelisted tags', () =>
	expect( clean( '<div></div>' ) ).toBe( '<div></div>' ) );

test( 'should strip out non-whitelisted tags', () =>
	expect( clean( '<marquee></marquee>' ) ).toBe( '' ) );

test( 'should strip out content with non-whitelisted tags', () =>
	expect( clean( '<p><script>alert("do bad things")</script></p>' ) ).toBe( '<p></p>' ) );

test( 'should allow whitelisted attributes', () =>
	expect( clean( '<img alt="graphic">' ) ).toBe( '<img alt="graphic">' ) );

test( 'should strip out non-whitelisted attributes', () =>
	expect( clean( '<span style="font-size: 128px;"></span>' ) ).toBe( '<span></span>' ) );

test( 'should encode whitelisted attributes', () =>
	expect( clean( '<img alt="javascript:foo()">' ) ).toBe( '<img alt="javascript%3Afoo()">' ) );

test( 'should not encode links', () => {
	const img = cleanNode( '<img src="http://example.com/images/1f39.png?v=25">' );
	expect( img.getAttribute( 'src' ) ).toBe( 'http://example.com/images/1f39.png?v=25' );

	const link = cleanNode( '<a id="test" href="https://github.com/README.md">docs</a>' );
	expect( link.getAttribute( 'href' ) ).toBe( 'https://github.com/README.md' );
} );

test( 'should set link params', () => {
	const link = cleanNode( '<a href="https://example.com">' );

	expect( link.getAttribute( 'target' ) ).toBe( '_blank' );

	const rel = link.getAttribute( 'rel' ).split( ' ' );
	expect( rel ).toContain( 'external' );
	expect( rel ).toContain( 'noopener' );
	expect( rel ).toContain( 'noreferrer' );
} );

test( 'should only set link params if href set', () => {
	expect( clean( '<a>link</a>' ) ).toBe( '<a>link</a>' );
} );

test( 'should bump up header levels', () => {
	expect( clean( '<h1></h1>' ) ).toBe( '<h3></h3>' );
	expect( clean( '<h2></h2>' ) ).toBe( '<h3></h3>' );
	expect( clean( '<h3></h3>' ) ).toBe( '<h3></h3>' );
	expect( clean( '<h4></h4>' ) ).toBe( '<h4></h4>' );
} );

test( 'should prevent known XSS attacks', () => {
	expect( clean( "<IMG SRC=JaVaScRiPt:alert('XSS')>" ) ).toBe( '<img>' );

	expect( clean( '<IMG SRC=javascript:alert(&quot;XSS&quot;)>' ) ).toBe( '<img>' );

	expect( clean( '<IMG """><SCRIPT>alert("XSS")</SCRIPT>">' ) ).toBe( '<img>"&gt;' );

	expect(
		clean(
			// <IMG SRC=javascript:alert(
			// 'XSS')>
			'<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;\n' +
				'&#39;&#88;&#83;&#83;&#39;&#41;>'
		)
	).toBe( '<img>' );

	expect( clean( "<img/onload=alert('XSS')>" ) ).toBe( '<img>' );

	expect( clean( '¼script¾alert(¢XSS¢)¼/script¾' ) ).toBe( '¼script¾alert(¢XSS¢)¼/script¾' );

	expect( clean( '<IFRAME SRC="javascript:alert(\'XSS\');"></IFRAME>' ) ).toBe( '' );

	expect( clean( '<DIV STYLE="background-image: url(javascript:alert(\'XSS\'))">' ) ).toBe(
		'<div></div>'
	);

	expect(
		clean( '<!--[if gte IE 4]>\n' + " <SCRIPT>alert('XSS');</SCRIPT>\n" + ' <![endif]-->' )
	).toBe( '' );

	expect( clean( '<IMG SRC="javas<!-- -->cript:alert(\'XSS\')">' ) ).toBe( '<img>' );

	expect(
		clean( '<META HTTP-EQUIV="Set-Cookie" Content="USERID=<SCRIPT>alert(\'XSS\')</SCRIPT>">' )
	).toBe( '' );

	expect(
		cleanNode(
			'<A HREF="javascript:document.location=\'http://www.google.com/\'">XSS</A>'
		).getAttribute( 'href' )
	).toBeNull();
} );
