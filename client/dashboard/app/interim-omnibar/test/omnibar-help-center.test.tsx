/**
 * @jest-environment jsdom
 */

import { omnibarSiteIdQuery, siteByIdQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import OmnibarHelpCenter from '../omnibar-help-center';
import type { Site } from '@automattic/api-core';

jest.mock( '@automattic/help-center', () => ( {
	__esModule: true,
	default: ( { site }: { site?: { ID: number } | null } ) => (
		<div role="region" aria-label="Help Center">
			{ site ? `site:${ site.ID }` : 'site:none' }
		</div>
	),
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

	test( 'hands the omnibar site to the Help Center', async () => {
		window.history.replaceState( {}, '', '/sites?help-center=home' );
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false } },
		} );
		queryClient.setQueryData( omnibarSiteIdQuery().queryKey, 456 );
		queryClient.setQueryData( siteByIdQuery( 456 ).queryKey, {
			ID: 456,
			name: 'Test Site',
			URL: 'https://test.example',
			slug: 'test.example',
			is_wpcom_atomic: false,
			jetpack: false,
			site_owner: 1,
		} as Site );

		render( <OmnibarHelpCenter />, { queryClient } );

		expect( await screen.findByRole( 'region', { name: 'Help Center' } ) ).toHaveTextContent(
			'site:456'
		);
	} );

	test( 'ignores unrelated query params', () => {
		window.history.replaceState( {}, '', '/sites?from=email' );

		const { container } = render( <OmnibarHelpCenter /> );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
