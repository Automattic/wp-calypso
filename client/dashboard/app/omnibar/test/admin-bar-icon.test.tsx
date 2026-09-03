/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { adminBarIcon } from '../admin-bar-icon';

describe( 'adminBarIcon', () => {
	it.each( [ 'comment', 'backup', 'page', 'video', 'rss', 'help', 'ask-ai' ] )(
		'resolves the %s glyph',
		( name ) => {
			const { container } = render(
				adminBarIcon( name, 'omnibar__help-icon' ) as React.ReactElement
			);

			expect( container.querySelector( '.omnibar__help-icon > svg' ) ).toBeVisible();
			expect( container.querySelector( 'path' ) ).toHaveAttribute( 'd' );
		}
	);

	it( 'hides the decorative glyph from assistive tech', () => {
		const { container } = render(
			adminBarIcon( 'help', 'omnibar__help-icon' ) as React.ReactElement
		);
		const svg = container.querySelector( 'svg' );

		expect( svg ).toHaveAttribute( 'aria-hidden', 'true' );
		expect( svg ).toHaveAttribute( 'focusable', 'false' );
	} );

	it.each( [
		[ 'no name', undefined ],
		[ 'an empty name', '' ],
		[ 'an unknown name', 'not-a-real-icon' ],
		[ 'an inherited object key', 'constructor' ],
		[ 'another inherited key', 'toString' ],
	] )( 'renders no icon given %s', ( _label, name ) => {
		expect( adminBarIcon( name, 'omnibar__help-icon' ) ).toBeUndefined();
	} );
} );
