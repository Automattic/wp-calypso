import { render, screen } from '@testing-library/react';
import { Badge } from '..';

describe( 'Badge', () => {
	it( 'renders an icon for non-default intents and no icon for the default intent', () => {
		// Non-default intents (info, success, warning, error) get a contextBasedIcon
		// which the Icon component renders as an SVG element.
		// The default intent returns null from contextBasedIcon — no SVG is rendered.
		const nonDefaultIntents = [ 'info', 'success', 'warning', 'error' ] as const;

		for ( const intent of nonDefaultIntents ) {
			const { unmount, container } = render( <Badge intent={ intent }>{ intent }</Badge> );
			expect( container.querySelector( 'svg' ) ).not.toBeNull();
			unmount();
		}

		const { container } = render( <Badge>Default</Badge> );
		expect( container.querySelector( 'svg' ) ).toBeNull();
	} );

	it( 'does not render an icon for the default intent', () => {
		// Regression: ensure omitting `intent` (which defaults to "default") produces
		// no decorative icon that could add noise to the accessible tree.
		render( <Badge data-testid="badge">No icon here</Badge> );
		const badge = screen.getByTestId( 'badge' );
		expect( badge.querySelector( 'svg' ) ).toBeNull();
	} );
} );
