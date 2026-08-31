/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { adminBarIcon } from '../admin-bar-icon';

const ICON =
	'<svg class="ab-icon" viewBox="0 0 24 24"><path d="M1 2z" fill-rule="evenodd" /></svg>';

describe( 'adminBarIcon', () => {
	it( 'rebuilds the glyph and keeps the wrapper class', () => {
		const { container } = render(
			adminBarIcon( 'omnibar__help-icon', ICON ) as React.ReactElement
		);

		expect( container.querySelector( '.omnibar__help-icon' ) ).toBeVisible();
		expect( container.querySelector( 'svg' ) ).toHaveAttribute( 'viewBox', '0 0 24 24' );
		expect( container.querySelector( 'path' ) ).toHaveAttribute( 'd', 'M1 2z' );
		expect( container.querySelector( 'path' ) ).toHaveAttribute( 'fill-rule', 'evenodd' );
	} );

	it( 'hides the decorative glyph from assistive tech', () => {
		const { container } = render(
			adminBarIcon( 'omnibar__help-icon', ICON ) as React.ReactElement
		);
		const svg = container.querySelector( 'svg' );

		expect( svg ).toHaveAttribute( 'aria-hidden', 'true' );
		expect( svg ).toHaveAttribute( 'focusable', 'false' );
	} );

	it( 'drops everything outside the svg and path allowlist', () => {
		const hostile =
			'<svg viewBox="0 0 24 24" onload="pwned()"><path d="M1 2z" /><img src="x" onerror="pwned()" /><script>pwned()</script></svg>';

		const { container } = render(
			adminBarIcon( 'omnibar__help-icon', hostile ) as React.ReactElement
		);

		expect( container.querySelector( 'img' ) ).toBeNull();
		expect( container.querySelector( 'script' ) ).toBeNull();
		expect( container.innerHTML ).not.toContain( 'onerror' );
		expect( container.innerHTML ).not.toContain( 'onload' );
		expect( container.querySelector( 'path' ) ).toHaveAttribute( 'd', 'M1 2z' );
	} );

	it.each( [
		[ 'nothing to render', undefined ],
		[ 'an empty string', '' ],
		[ 'markup with no svg', '<span>Help</span>' ],
		[ 'an svg with no paths', '<svg viewBox="0 0 24 24"><circle r="4" /></svg>' ],
	] )( 'renders no icon given %s', ( _label, markup ) => {
		expect( adminBarIcon( 'omnibar__help-icon', markup ) ).toBeUndefined();
	} );
} );
