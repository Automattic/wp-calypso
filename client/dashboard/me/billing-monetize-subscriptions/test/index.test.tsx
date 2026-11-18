/**
 * @vitest-environment jsdom
 */
import { createRouter } from '@tanstack/react-router';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { createMeRoutes } from '../../../app/router/me';
import { rootRoute } from '../../../app/router/root';
import { render } from '../../../test-utils';
import MonetizeSubscriptions from '../index';

const API_BASE = 'https://public-api.wordpress.com';

const subscription = {
	ID: '10',
	currency: 'USD',
	end_date: null,
	product_id: '20',
	renew_interval: '1 month',
	is_renewable: true,
	renewal_price: '5',
	site_id: '30',
	site_title: 'Example Site',
	site_url: 'https://example.com',
	start_date: '2026-01-01T00:00:00+00:00',
	status: 'active',
	title: 'Monthly membership',
};

// The page links to routes whose paths only resolve once a router builds the
// real route tree. The router is never navigated.
beforeAll( () => {
	createRouter( {
		routeTree: rootRoute.addChildren( createMeRoutes( APP_CONTEXT_DEFAULT_CONFIG ) ),
		context: { config: APP_CONTEXT_DEFAULT_CONFIG },
	} );
} );

function mockSubscriptions( subscriptions: object[] ) {
	nock( API_BASE )
		.get( '/rest/v1.1/me/memberships/subscriptions' )
		.query( true )
		.reply( 200, { subscriptions } );
}

describe( '<MonetizeSubscriptions>', () => {
	test( 'replaces the table and its toolbar with an empty state when there is nothing to list', async () => {
		mockSubscriptions( [] );

		render( <MonetizeSubscriptions /> );

		expect(
			await screen.findByRole( 'heading', { name: 'No memberships or donations yet' } )
		).toBeVisible();
		expect(
			screen.getByText(
				'Paid subscriptions and donations to other WordPress.com sites will appear here.'
			)
		).toBeVisible();
		expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
	} );

	test( 'does not show the empty state while the request is still loading', async () => {
		let release: () => void = () => {};
		const gate = new Promise< void >( ( resolve ) => {
			release = resolve;
		} );
		const scope = nock( API_BASE )
			.get( '/rest/v1.1/me/memberships/subscriptions' )
			.query( true )
			.reply( 200, async () => {
				await gate;
				return { subscriptions: [] };
			} );

		render( <MonetizeSubscriptions /> );

		// The request has reached the server and is held open.
		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		expect( screen.getByRole( 'searchbox', { name: 'Search' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'No memberships or donations yet' } )
		).not.toBeInTheDocument();

		release();

		expect(
			await screen.findByRole( 'heading', { name: 'No memberships or donations yet' } )
		).toBeVisible();
	} );

	test( 'does not show the empty state when the request fails', async () => {
		nock( API_BASE )
			.get( '/rest/v1.1/me/memberships/subscriptions' )
			.query( true )
			.reply( 500, {} );

		render( <MonetizeSubscriptions /> );

		expect( await screen.findByText( 'No results' ) ).toBeVisible();
		expect( screen.getByRole( 'searchbox', { name: 'Search' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'heading', { name: 'No memberships or donations yet' } )
		).not.toBeInTheDocument();
	} );

	test( 'keeps the toolbar and shows a search empty state when nothing matches', async () => {
		const user = userEvent.setup();
		mockSubscriptions( [ subscription ] );

		render( <MonetizeSubscriptions /> );

		const searchbox = await screen.findByRole( 'searchbox', { name: 'Search' } );
		expect(
			screen.queryByRole( 'heading', { name: 'No memberships or donations yet' } )
		).not.toBeInTheDocument();

		await user.type( searchbox, 'nomatch' );

		expect(
			await screen.findByRole( 'heading', {
				name: 'No memberships or donations match your search',
			} )
		).toBeVisible();
		expect( screen.getByText( 'Try a different search term.' ) ).toBeVisible();
		expect( screen.getByRole( 'searchbox', { name: 'Search' } ) ).toBeVisible();
	} );
} );
