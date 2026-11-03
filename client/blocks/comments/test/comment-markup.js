/**
 * @jest-environment jsdom
 */
import { blocksToHtml } from '../comment-markup';

describe( 'blocksToHtml', () => {
	it( 'writes paragraphs as text that wpautop splits again', () => {
		expect(
			blocksToHtml(
				'<!-- wp:paragraph --><p>One<br>line</p><!-- /wp:paragraph -->\n\n' +
					'<!-- wp:paragraph --><p>Two &lt;3</p><!-- /wp:paragraph -->'
			)
		).toBe( 'One\nline\n\nTwo &lt;3' );
	} );

	it( 'keeps links and the formats kses allows', () => {
		expect(
			blocksToHtml(
				'<p><strong>Bold</strong> <em>it</em> <a href="https://example.com/?a=1&amp;b=2" target="_blank">link</a> <mark>hi</mark></p>'
			)
		).toBe(
			'<strong>Bold</strong> <em>it</em> <a href="https://example.com/?a=1&amp;b=2">link</a> hi'
		);
	} );

	it( 'drops links that are not web or mail addresses', () => {
		expect( blocksToHtml( '<p><a href="javascript:alert(1)">x</a></p>' ) ).toBe( 'x' );
	} );

	it( 'writes lists as lines, nested ones indented', () => {
		expect(
			blocksToHtml( '<ol><li>First<ul><li>Inner</li></ul></li><li><em>Second</em></li></ol>' )
		).toBe( '1. First\n  - Inner\n2. <em>Second</em>' );
	} );

	it( 'keeps quotes and code', () => {
		expect(
			blocksToHtml(
				'<blockquote class="wp-block-quote"><p>Said</p></blockquote><pre class="wp-block-code"><code>a &lt; b</code></pre>'
			)
		).toBe( '<blockquote>Said</blockquote>\n\n<code>a &lt; b</code>' );
	} );
} );
