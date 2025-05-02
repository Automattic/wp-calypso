/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
	Outlet,
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
} from '@tanstack/react-router';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import Sites from '..';
import { Site } from '../../data/types';

describe( 'Sites', () => {
	const queryClient = new QueryClient();

	const renderSites = async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/me/sites' )
			.query( true )
			.reply( 200, {
				sites: [
					{
						ID: '123',
						URL: 'https://deleted.wordpress.com',
						name: 'Deleted Site',
						subscribers_count: 1,
						is_deleted: true,
					} as Site,
					{
						ID: '456',
						URL: 'https://test.wordpress.com',
						name: 'Test Site',
						subscribers_count: 4,
						plan: {
							features: {
								active: [ 'backups' ],
							},
						},
						active_modules: [ 'protect' ],
					} as Site,
				],
			} );

		const rootRoute = createRootRoute( {
			component: () => <Outlet />,
		} );

		const sitesRoute = createRoute( {
			getParentRoute: () => rootRoute,
			path: 'sites',
			component: Sites,
		} );

		const router = createRouter( {
			defaultPendingMinMs: 0,
			history: createMemoryHistory( {
				initialEntries: [ '/sites' ],
			} ),
			routeTree: rootRoute.addChildren( [ sitesRoute ] ),
		} );

		render(
			<QueryClientProvider client={ queryClient }>
				<RouterProvider router={ router } />
			</QueryClientProvider>
		);

		await screen.findByRole( 'heading', { name: /sites/i } );
	};

	describe( 'grid layout', () => {
		it( 'renders the sites', async () => {
			await renderSites();

			const links = screen.getAllByRole( 'link' );

			expect( links[ 0 ] ).toHaveTextContent( 'deleted.wordpress.com' );
			expect( links[ 0 ] ).toHaveAttribute( 'href', 'https://deleted.wordpress.com' );

			expect( links[ 1 ] ).toHaveTextContent( 'test.wordpress.com' );
			expect( links[ 1 ] ).toHaveAttribute( 'href', 'https://test.wordpress.com' );
		} );
	} );

	describe( 'table layout', () => {
		it( 'renders the sites', async () => {
			await renderSites();
			await userEvent.click( screen.getByRole( 'button', { name: /layout/i } ) );
			await userEvent.click( screen.getByRole( 'menuitemradio', { name: /table/i } ) );

			const rows = screen.getAllByRole( 'row' );

			const header = within( rows[ 0 ] ).getAllByRole( 'columnheader' );
			[ /site/i, /subscribers/i, /status/i, /backups/i, /protect/i, /actions/i ].forEach(
				( text, idx ) => {
					expect( header[ idx ] ).toHaveTextContent( text );
				}
			);

			const site1 = within( rows[ 1 ] ).getAllByRole( 'cell' );
			const site1Link = within( site1[ 0 ] ).getByRole( 'link' );
			expect( site1Link ).toHaveTextContent( 'deleted.wordpress.com' );
			expect( site1Link ).toHaveAttribute( 'href', 'https://deleted.wordpress.com' );
			expect( site1[ 1 ] ).toHaveTextContent( '1' );
			expect( site1[ 2 ] ).toHaveTextContent( /deleted/i );
			expect( site1[ 3 ] ).toHaveTextContent( /disabled/i );
			expect( site1[ 4 ] ).toHaveTextContent( /disabled/i );

			const site2 = within( rows[ 2 ] ).getAllByRole( 'cell' );
			const site2Link = within( site2[ 0 ] ).getByRole( 'link' );
			expect( site2Link ).toHaveTextContent( 'test.wordpress.com' );
			expect( site2Link ).toHaveAttribute( 'href', 'https://test.wordpress.com' );
			expect( site2[ 1 ] ).toHaveTextContent( '4' );
			expect( site2[ 2 ] ).toHaveTextContent( /public/i );
			expect( site2[ 3 ] ).not.toHaveTextContent( /disabled/i );
			expect( site2[ 4 ] ).not.toHaveTextContent( /disabled/i );
		} );
	} );
} );
