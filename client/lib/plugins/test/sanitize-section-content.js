/**
 * @jest-environment jsdom
 */
import '../jsdom-test-globals-fix';
import { JSDOM } from 'jsdom';
import fixtures from '../malformed-html-fixtures';
import {
	sanitizeSectionContent as clean,
	overrideSanitizeSectionRoot,
} from '../sanitize-section-content';
/**
 * Attempts to create a DOM node from given HTML
 *
 * @param {string} html expected HTML to create node
 * @returns {Object | null} possible node described by HTML
 */
const jsdomWindow = new JSDOM().window;
const cleanNode = ( html ) => {
	const div = document.createElement( 'div' );

	div.innerHTML = clean( html );

	return div.firstChild;
};

const runTests = ( isSSR = false ) => {
	beforeEach( () => {
		overrideSanitizeSectionRoot( isSSR ? jsdomWindow : window );
	} );

	test( 'should not strip allowed tags', () =>
		expect( clean( '<div>👍</div>' ) ).toBe( '<div>👍</div>' ) );

	test( 'should strip out disallowed tags', () =>
		expect( clean( '<marquee></marquee>' ) ).toBe( '' ) );

	test( 'should preserve children of stripped tags', () =>
		expect( clean( '<unsupported><b>👍</b></unsupported>' ) ).toBe( '<b>👍</b>' ) );

	test( 'should strip out content with disallowed tags', () =>
		expect( clean( '<p><script>alert("do bad things")</script>👍</p>' ) ).toBe(
			'<p>alert("do bad things")👍</p>'
		) );

	test( 'should strip out disallowed children', () =>
		expect( clean( '<marquee><marquee>👍</marquee></marquee>' ) ).toBe( '👍' ) );

	test( 'should not break when no attributes present', () =>
		expect( clean( '<p></p>' ) ).toBe( '<p></p>' ) );

	test( 'should not strip allowed attributes', () =>
		expect( clean( '<img alt="graphic">' ) ).toBe( '<img alt="graphic">' ) );

	test( 'should strip out disallowed attributes', () =>
		expect( clean( '<span style="font-size: 128px;">👍</span>' ) ).toBe( '<span>👍</span>' ) );

	test( 'should allow http(s) links', () => {
		const img = cleanNode( '<img src="http://example.com/images/1f39.png?v=25">' );
		expect( img ).toHaveAttribute( 'src', 'http://example.com/images/1f39.png?v=25' );

		const link = cleanNode( '<a id="test" href="https://github.com/README.md">docs</a>' );
		expect( link ).toHaveAttribute( 'href', 'https://github.com/README.md?referrer=wordpress.com' );
	} );

	test( 'should omit non http(s) links', () => {
		expect( clean( '<style><img alt="\u0022 src=x onerror=alert(1)//">' ) ).toBe( '' );
		expect(
			clean( '<IMG src="https://aaa" ><div>aaa<style><img alt="\u0022 src=x onerror=alert(1)//">' )
		).toBe( '<img src="https://aaa"><div>aaa&lt;img alt="" src=x onerror=alert(1)//"&gt;</div>' );
		expect( cleanNode( '<a href="file:///etc/passwd">a</a>' ) ).not.toHaveAttribute( 'href' );
		expect( cleanNode( '<a href="javascript:alert(o)">a</a>' ) ).not.toHaveAttribute( 'href' );
		expect( cleanNode( '<a href="ssh://bankvault">a</a>' ) ).not.toHaveAttribute( 'href' );
		expect( cleanNode( '<a href="deep+link">a</a>' ) ).not.toHaveAttribute( 'href' );
	} );

	test( 'should set link params', () => {
		const link = cleanNode( '<a href="https://example.com">' );

		expect( link ).toHaveAttribute( 'target', '_blank' );

		const rel = link.getAttribute( 'rel' ).split( ' ' );
		expect( rel ).toContain( 'external' );
		expect( rel ).toContain( 'noopener' );
		expect( rel ).toContain( 'noreferrer' );
	} );

	test( 'should add referrer query parameter', () => {
		const link = cleanNode( '<a href="https://example.com?other-query">' );

		expect( link ).toHaveAttribute(
			'href',
			'https://example.com?other-query=&referrer=wordpress.com'
		);
	} );

	test( 'should only set link params if href set', () => {
		expect( clean( '<a>link</a>' ) ).toBe( '<a>link</a>' );
	} );

	test( 'should secure Youtube sources', () => {
		const embed = cleanNode(
			'<iframe type="text/html" class="youtube-player" src="http://youtube.com/123456" />'
		);

		expect( embed ).toHaveAttribute( 'src', 'https://youtube.com/123456' );
	} );

	test( 'should bump up header levels', () => {
		expect( clean( '<h1>👍</h1>' ) ).toBe( '<h3>👍</h3>' );
		expect( clean( '<h2>👍</h2>' ) ).toBe( '<h3>👍</h3>' );
		expect( clean( '<h3>👍</h3>' ) ).toBe( '<h3>👍</h3>' );
		expect( clean( '<h4>👍</h4>' ) ).toBe( '<h4>👍</h4>' );
	} );

	test( 'should strip out <script> tags', () => expect( clean( '<script></script>' ) ).toBe( '' ) );

	/**
	 * The following tests have borrowed from the OWASP XSS Cheat Sheet
	 *
	 * @see https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
	 *
	 * Instead of pulling all of the tests the ones included are a sampling
	 * subjectively chosen to represent the visible attack vectors. For
	 * example, many of the attacks center around improper parsing of HTML
	 * which leads to unexpected `<script>` tags. However, we are using
	 * the browser's parser and not our own and thus don't need to test for
	 * some of those situations. We are already verifying that we strip
	 * <script> tags as well as disallowed attributes, so in order for
	 * those security-related tests to fail our earlier tests would have
	 * also failed, and again we don't need to double-test them.
	 *
	 * Other tests were skipped because unless specifically verified as a
	 * viable URL in an `href` or `src` attribute, all other attribute
	 * data is encoded so that it should be impossible to end up with any
	 * javascript code. Therefore attacks through event handlers and the
	 * like should simply not be possible.
	 */
	test( 'should prevent known XSS attacks', () => {
		expect( clean( "<IMG SRC=JaVaScRiPt:alert('XSS')>" ) ).toBe( '<img>' );

		expect( clean( '<IMG SRC=javascript:alert(&quot;XSS&quot;)>' ) ).toBe( '<img>' );

		expect( clean( '<IMG """><SCRIPT>alert("XSS")</SCRIPT>">' ) ).toBe( '<img>alert("XSS")"&gt;' );

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
			cleanNode( '<A HREF="javascript:document.location=\'http://www.google.com/\'">XSS</A>' )
		).not.toHaveAttribute( 'href' );
	} );

	test( 'should prevent backspace-based XSS attacks', () => {
		const link = cleanNode(
			'<a href="http://example.com">' + '\u0008'.repeat( 71 ) + 'javascript:alert(1)\u0022>xss</a>'
		);

		expect( link ).toHaveAttribute( 'href', 'http://example.com?referrer=wordpress.com' );
	} );

	test( 'should sanitize empty', () => {
		expect( clean( '' ) ).toBe( '' );
	} );

	test( 'should sanitize simple text', () => {
		expect( clean( 'hello world' ) ).toBe( 'hello world' );
	} );

	test( 'should sanitize entities', () => {
		expect( clean( '&lt;hello world&gt;' ) ).toBe( '&lt;hello world&gt;' );
	} );

	test( 'should remove unknown tags', () => {
		expect( clean( '<u:y><b>hello <bogus><i>world</i></bogus></b>' ) ).toBe(
			'<b>hello <i>world</i></b>'
		);
	} );

	test( 'should remove unsafe tags', () => {
		expect( clean( '<b>hello <i>world</i><script src=foo.js></script></b>' ) ).toBe(
			'<b>hello <i>world</i></b>'
		);
	} );

	test( 'should remove unsafe attributes', () => {
		expect( clean( '<b>hello <i onclick="takeOverWorld(this)">world</i></b>' ) ).toBe(
			'<b>hello <i>world</i></b>'
		);
	} );

	test( 'should escape cruft', () => {
		expect( clean( '<b>hello <i>world<</i></b> & tomorrow the universe' ) ).toBe(
			'<b>hello <i>world&lt;</i></b> &amp; tomorrow the universe'
		);
	} );

	fixtures.forEach( ( { title, payload, expected, expectedSSR }, index ) => {
		test( `Fixture test #${ index }: ${ title } `, () => {
			const toBeExpected = isSSR ? expectedSSR || expected : expected;
			expect( clean( payload ) ).toBe( toBeExpected );
		} );
	} );
};

describe( 'Content Sanitizer should work on client-side', () => {
	runTests();
} );

describe( 'Content Sanitizer should work on server-side', () => {
	runTests( true );
} );
