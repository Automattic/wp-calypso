/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import OmnibarHelpCenter from '../omnibar-help-center';

jest.mock( '@automattic/help-center', () => ( {
	__esModule: true,
	default: () => <div role="region" aria-label="Help Center" />,
} ) );

describe( '<OmnibarHelpCenter />', () => {
	afterEach( () => {
		window.history.replaceState( {}, '', '/' );
	} );

	test( 'renders nothing when the Help Center is closed', () => {
		const { container } = render( <OmnibarHelpCenter /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'mounts the Help Center when the URL asks for it', async () => {
		window.history.replaceState( {}, '', '/sites?help-center=home' );

		render( <OmnibarHelpCenter /> );

		expect( await screen.findByRole( 'region', { name: 'Help Center' } ) ).toBeVisible();
	} );

	test( 'mounts the Help Center for every deep link value', async () => {
		for ( const value of [ 'wapuu', 'subscribe-block', 'happiness-engineer' ] ) {
			window.history.replaceState( {}, '', `/sites?help-center=${ value }` );

			const { unmount } = render( <OmnibarHelpCenter /> );

			expect( await screen.findByRole( 'region', { name: 'Help Center' } ) ).toBeVisible();

			unmount();
		}
	} );

	test( 'ignores unrelated query params', () => {
		window.history.replaceState( {}, '', '/sites?from=email' );

		const { container } = render( <OmnibarHelpCenter /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
