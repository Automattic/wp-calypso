/**
 * @jest-environment jsdom
 */

import DOMPurify from 'dompurify';
import { sanitizeReviewRichText } from './sanitize-review-rich-text';

describe( 'sanitizeReviewRichText', () => {
	it( 'keeps the supported Gutenberg inline text formats', () => {
		const html =
			'<strong><em>bold italic</em></strong> <code>code</code> <kbd>key</kbd> <s>removed</s> <sup>2</sup> <sub>n</sub><br><bdo dir="rtl" lang="ar">لغة</bdo>';
		expect( sanitizeReviewRichText( html ) ).toBe( html );
	} );

	it( 'keeps underline and inline-colour formatting', () => {
		const html =
			'<span style="text-decoration: underline;">underlined</span> <mark class="has-inline-color has-vivid-red-color" style="background-color: transparent; color: rgb(179, 36, 36);">highlighted</mark>';
		expect( sanitizeReviewRichText( html ) ).toBe( html );
	} );

	it( 'removes layout, URL-bearing, and unrelated inline styles', () => {
		const html =
			'<span style="position:fixed;inset:0;min-width:1200px;font-size:48px;background-image:url(https://example.com/pixel.gif);color:red;text-decoration:underline">text</span><mark style="position:absolute;background-image:url(https://example.com/pixel.gif);color:red">colour</mark>';
		expect( sanitizeReviewRichText( html ) ).toBe(
			'<span style="text-decoration: underline;">text</span><mark style="color: red;">colour</mark>'
		);
	} );

	it( 'keeps only WordPress inline-colour classes on mark elements', () => {
		expect(
			sanitizeReviewRichText(
				'<mark class="has-inline-color overlay wp-element-button">colour</mark><span class="has-vivid-red-color">span</span>'
			)
		).toBe( '<mark class="has-inline-color">colour</mark><span>span</span>' );
	} );

	it( 'keeps language attributes only on language formatting', () => {
		expect(
			sanitizeReviewRichText(
				'<bdo dir="rtl" lang="ar">لغة</bdo><bdo dir="sideways">text</bdo><span dir="rtl" lang="ar">span</span>'
			)
		).toBe( '<bdo dir="rtl" lang="ar">لغة</bdo><bdo>text</bdo><span>span</span>' );
	} );

	it( 'drops media elements so the preview cannot fetch their resources', () => {
		expect( sanitizeReviewRichText( '<img src="https://example.com/px.gif">text' ) ).toBe( 'text' );
		expect(
			sanitizeReviewRichText(
				'<video src="https://example.com/v.mp4" poster="https://example.com/p.jpg"></video>text'
			)
		).toBe( 'text' );
		expect( sanitizeReviewRichText( '<audio src="https://example.com/a.mp3"></audio>text' ) ).toBe(
			'text'
		);
	} );

	it( 'unwraps unsupported elements to readable text', () => {
		expect(
			sanitizeReviewRichText( '<table><tbody><tr><td>cell</td></tr></tbody></table>after' )
		).toBe( 'cellafter' );
		expect( sanitizeReviewRichText( '<h1>heading</h1>tail' ) ).toBe( 'headingtail' );
		expect(
			sanitizeReviewRichText( '<details><summary>summary</summary>hidden</details>tail' )
		).toBe( 'summaryhiddentail' );
	} );

	it( 'removes scripts and event handlers', () => {
		expect( sanitizeReviewRichText( 'safe<script>window.pwned = true;</script>' ) ).toBe( 'safe' );
		expect( sanitizeReviewRichText( '<strong onclick="window.pwned = true">x</strong>' ) ).toBe(
			'<strong>x</strong>'
		);
	} );

	it( 'keeps link text while removing navigation attributes', () => {
		expect(
			sanitizeReviewRichText(
				'<a href="https://example.com" target="_blank" rel="noopener">link</a>'
			)
		).toBe( '<a>link</a>' );
	} );

	it( 'strips data and ARIA attributes', () => {
		expect(
			sanitizeReviewRichText( '<strong data-tracking="1" aria-label="replacement">text</strong>' )
		).toBe( '<strong>text</strong>' );
	} );

	it( 'preserves entities and escapes literal angle brackets', () => {
		expect( sanitizeReviewRichText( 'Fees &amp; charges' ) ).toBe( 'Fees &amp; charges' );
		expect( sanitizeReviewRichText( '5 < 10 stays' ) ).toBe( '5 &lt; 10 stays' );
	} );

	it( 'does not install its attribute policy on the shared DOMPurify instance', () => {
		sanitizeReviewRichText( '<span style="position:fixed">text</span>' );

		expect(
			DOMPurify.sanitize( '<span style="position:fixed">text</span>', {
				ALLOWED_TAGS: [ 'span' ],
				ALLOWED_ATTR: [ 'style' ],
			} )
		).toBe( '<span style="position:fixed">text</span>' );
	} );
} );
