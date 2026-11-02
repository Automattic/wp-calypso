/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import PurchasesList from '../index';
import type { Purchase } from '@automattic/api-core';

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn( () => '' );
	return Object.assign( fn, {
		__esModule: true,
		default: fn,
		isEnabled: jest.fn( ( flag: string ) => flag === 'purchases/split-cancel-remove' ),
	} );
} );

jest.mock( '../../../app/router/me', () => {
	const { useRouterState } = jest.requireActual( '@tanstack/react-router' );
	const actual = jest.requireActual( '../../../app/router/me' );
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
		nock.cleanAll();
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
		mockRequests(
			[ { ID: '5', product_name: 'Personal', blog_id: '1', user_id: '1' } as never ],
			200
		);
		window.history.replaceState( null, '', '/me/billing/purchases?removed=plan&removedId=5' );

		render( <PurchasesList /> );

		expect( await screen.findByText( /Your plan has been removed/ ) ).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		await waitFor( () =>
			expect( screen.queryByText( /Your plan has been removed/ ) ).not.toBeInTheDocument()
		);
	} );
} );
