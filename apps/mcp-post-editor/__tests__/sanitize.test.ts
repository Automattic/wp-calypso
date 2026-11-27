/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import sanitize from '../editor/sanitize';

describe( 'sanitize', () => {
	it( 'keeps the slots InnerContent mounts nested blocks in', () => {
		const slot =
			'<wp-inner-block-slot data-slot-index="0" style="display: contents"></wp-inner-block-slot>';
		expect( sanitize( `<div>${ slot }</div>` ) ).toBe( `<div>${ slot }</div>` );
	} );

	it( 'still removes scripts and iframes', () => {
		expect(
			sanitize(
				'<p>Hi</p><script>alert(1)</script><iframe srcdoc="<script>alert(1)</script>"></iframe>'
			)
		).toBe( '<p>Hi</p>' );
	} );
} );
