/**
 * @jest-environment jsdom
 */
import { html } from '../index';

describe( 'indices-to-html rich content parsing', () => {
	// Notification bodies from non-Gutenberg P2s lean on these range types for
	// code. The redesigned panel must keep parsing them into real <code>/<pre>
	// elements (with their wpnc__ classes) so the restored styling has something
	// to target. See DOTMSD-1325.
	it( 'wraps an inline `code` range in <code class="wpnc__code">', () => {
		const output = html( {
			text: 'run yarn start',
			ranges: [ { type: 'code', indices: [ 4, 14 ] } ],
		} );

		expect( output ).toContain( '<code class="wpnc__code">yarn start</code>' );
	} );

	it( 'wraps a `pre` range in <pre class="wpnc__pre">', () => {
		const output = html( {
			text: 'const a = 1;',
			ranges: [ { type: 'pre', indices: [ 0, 12 ] } ],
		} );

		expect( output ).toContain( '<pre class="wpnc__pre">' );
		expect( output ).toContain( 'const a = 1;' );
	} );

	it( 'keeps a `code` range nested inside a `pre` block', () => {
		const output = html( {
			text: 'const a = 1;',
			ranges: [
				{ id: 0, type: 'pre', indices: [ 0, 12 ] },
				{ id: 1, parent: 0, type: 'code', indices: [ 0, 12 ] },
			],
		} );

		expect( output ).toContain( '<pre class="wpnc__pre">' );
		expect( output ).toContain( '<code class="wpnc__code">' );
	} );
} );
