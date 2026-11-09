/**
 * @jest-environment jsdom
 */

import { omnibarSiteIdQuery, siteByIdQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { act, screen } from '@testing-library/react';
import { dispatch } from '@wordpress/data';
import { HELP_CENTER_STORE, type HelpCenterDispatch } from '..';
import { render } from '../../../test-utils';
import HelpCenter from '../help-center';
import type { Site } from '@automattic/api-core';

jest.mock( '@automattic/help-center', () => ( {
	__esModule: true,
	default: ( { site }: { site?: { ID: number } | null } ) => (
		<div role="region" aria-label="Help Center">
			{ site ? `site:${ site.ID }` : 'site:none' }
		</div>
	),
} ) );

describe( '<HelpCenter />', () => {
	afterEach( () => {
		window.history.replaceState( {}, '', '/' );
		window.localStorage.clear();
	} );

	test( 'renders nothing when the Help Center is closed', () => {
		const { container } = render( <HelpCenter /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'mounts the Help Center when the URL asks for it', async () => {
		window.history.replaceState( {}, '', '/sites?help-center=home' );

		render( <HelpCenter /> );

		expect( await screen.findByRole( 'region', { name: 'Help Center' } ) ).toBeVisible();
	} );

	test( 'mounts the Help Center for every deep link value', async () => {
		for ( const value of [ 'wapuu', 'subscribe-block', 'happiness-engineer' ] ) {
			window.history.replaceState( {}, '', `/sites?help-center=${ value }` );

			const { unmount } = render( <HelpCenter /> );

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

		render( <HelpCenter />, { queryClient } );

		expect( await screen.findByRole( 'region', { name: 'Help Center' } ) ).toHaveTextContent(
			'site:456'
		);
	} );

	test( 'ignores unrelated query params', () => {
		window.history.replaceState( {}, '', '/sites?from=email' );

		const { container } = render( <HelpCenter /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	test( "saves the first opening to the signed-in user's preferences for the app", async () => {
		render( <HelpCenter product="a4a" /> );

		const { HelpCenter: HelpCenterStore, setRequester } = await import( '@automattic/data-stores' );
		const requester = jest.fn( async () => ( { calypso_preferences: {} } ) );
		setRequester( requester as Parameters< typeof setRequester >[ 0 ] );
		HelpCenterStore.register();
		await act( () =>
			( dispatch( HELP_CENTER_STORE ) as HelpCenterDispatch ).setShowHelpCenter( true )
		);

		expect( await screen.findByRole( 'region', { name: 'Help Center' } ) ).toBeVisible();
		expect( requester ).toHaveBeenCalledWith(
			expect.objectContaining( {
				method: 'PUT',
				body: { calypso_preferences: { help_center_open_a4a: true } },
			} )
		);
		expect(
			window.localStorage.getItem( 'logged_out_help_center_preferences_help_center_open' )
		).toBeNull();
	} );
} );
