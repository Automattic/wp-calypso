/**
 * @vitest-environment jsdom
 */
import { rawUserPreferencesQuery, userPurchasesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { useRouterState } from '@tanstack/react-router';
import { act, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../test-utils';
import PurchasesList from '../index';
import type { Purchase } from '@automattic/api-core';

vi.mock( '@automattic/calypso-config', async ( importOriginal ) => {
	const isEnabled = vi.fn( ( flag: string ) => flag === 'purchases/split-cancel-remove' );
	return {
		...( await importOriginal< typeof import( '@automattic/calypso-config' ) >() ),
		default: Object.assign(
			vi.fn( () => '' ),
			{ isEnabled }
		),
		isEnabled,
	};
} );

vi.mock( '../../../app/router/me', async () => {
	const { useRouterState } =
		await vi.importActual< typeof import( '@tanstack/react-router' ) >( '@tanstack/react-router' );
	const actual =
		await vi.importActual< typeof import( '../../../app/router/me' ) >( '../../../app/router/me' );
	return {
		...actual,
		purchasesRoute: {
			...actual.purchasesRoute,
			// The test router has only a root route, so read its parsed search directly.
			useSearch: () =>
				useRouterState( {
					select: ( state: { location: { search: unknown } } ) => state.location.search,
				} ),
		},
	};
} );

const API = 'https://public-api.wordpress.com';

const PURCHASE = {
	product_name: 'Personal',
	product_slug: 'personal-bundle',
	product_type: 'bundle',
};

// Mounts the page with the navigation that brings its params, as a route change does, so the
// page first renders while the router is still pending.
function PurchasesListAfterNavigation() {
	const hasArrived = useRouterState( {
		select: ( state ) => state.location.pathname !== '/',
	} );
	return hasArrived ? <PurchasesList /> : null;
}

function mockRequests( purchases: Partial< Purchase >[] = [], purchasesDelay = 0 ) {
	nock( API )
		.get( '/rest/v1.2/upgrades' )
		.query( ( query ) => ! query.type )
		.delay( purchasesDelay )
		.reply( 200, purchases );
	nock( API ).get( '/rest/v1.2/upgrades' ).query( { type: 'transferred' } ).reply( 200, [] );
	nock( API ).get( '/rest/v1.2/me/sites' ).query( true ).reply( 200, { sites: [] } );
	nock( API )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } )
		.persist();
}

describe( 'removed purchase notice', () => {
	afterEach( () => {
		window.history.replaceState( null, '', '/' );
	} );

	test( 'shows the notice from the URL, then removes its params', async () => {
		mockRequests();
		window.history.replaceState(
			null,
			'',
			'/me/billing/purchases?removed=plan&removedId=5&removedDomain=example.com&page=2'
		);

		render( <PurchasesList /> );

		expect( await screen.findByText( /Your plan has been removed/ ) ).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '?page=2' ) );
		expect( screen.getByText( /Your plan has been removed/ ) ).toBeVisible();
		expect(
			screen.getByRole( 'link', { name: 'Download backup (opens in a new tab)' } )
		).toHaveAttribute( 'href', 'https://example.com/wp-admin/export.php' );
	} );

	test( 'hides the notice when the removed purchase comes back', async () => {
		mockRequests( [ { ...PURCHASE, ID: '5', blog_id: '1', user_id: '1' } as never ], 200 );
		window.history.replaceState( null, '', '/me/billing/purchases?removed=plan&removedId=5' );

		render( <PurchasesList /> );

		expect( await screen.findByText( /Your plan has been removed/ ) ).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		await waitFor( () =>
			expect( screen.queryByText( /Your plan has been removed/ ) ).not.toBeInTheDocument()
		);
		expect( screen.getByText( 'Personal' ) ).toBeVisible();
	} );

	test( 'keeps the notice hidden when the removed purchase came back before the page loaded', async () => {
		mockRequests();
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false, staleTime: Infinity } },
		} );
		queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {} );
		queryClient.setQueryData( userPurchasesQuery().queryKey, [
			{ ...PURCHASE, ID: 5, blog_id: 1, user_id: 1 } as never,
		] );

		const { router } = render( <PurchasesListAfterNavigation />, { queryClient } );
		act( () => router.history.push( '/me/billing/purchases?removed=plan&removedId=5' ) );

		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		expect( await screen.findByText( 'Personal' ) ).toBeVisible();
		expect( screen.queryByText( /Your plan has been removed/ ) ).not.toBeInTheDocument();
	} );
} );
