/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { createReduxStore } from 'calypso/state/index';
import { LinkInBioBanner } from '../link-in-bio-banner';

describe( '<LinkInBioBanner>', () => {
	test.each( [
		//visible and right amount of rows - show
		[ 1, 'row', 'row-banner', true ],
		[ 2, 'grid', 'tile-banner', true ],
		// visible but too many rows - don't show
		[ 3, 'row', 'row-banner', false ],
		[ 3, 'grid', 'tile-banner', false ],
		//visible and right amount of rows, but already has Link in Bio site - don't show
		[ 1, 'row', 'row-banner', false, 'link-in-bio' ],
	] )(
		'Parameters: site count: %s, type: %s, output: %s, expectValue: %s, siteIntent: %s',
		( siteCount, type, output, expectValue, siteIntent = 'other' ) => {
			const store = createTestStore( siteCount, siteIntent );
			const queryClient = new QueryClient( {
				defaultOptions: {
					queries: {
						// No need to fetch because default site data will come from Redux store.
						enabled: false,
					},
				},
			} );

			render(
				<QueryClientProvider client={ queryClient }>
					<Provider store={ store }>
						<LinkInBioBanner displayMode={ type as 'row' | 'grid' } />
					</Provider>
				</QueryClientProvider>
			);
			if ( expectValue ) {
				// eslint-disable-next-line jest/no-conditional-expect
				expect( screen.getByTestId( output ) ).toBeInTheDocument();
			} else {
				// eslint-disable-next-line jest/no-conditional-expect
				expect( screen.queryByTestId( output ) ).not.toBeInTheDocument();
			}
		}
	);
} );

function createTestStore( siteCount: number, site_intent: string ) {
	const items: Record< string, unknown > = {};

	Array.from( { length: siteCount } ).forEach( ( _, index ) => {
		items[ `${ index + 1 }` ] = {
			ID: index + 1,
			options: {
				site_intent,
			},
		};
	} );
	return createReduxStore(
		{
			currentUser: {
				user: {
					ID: 'test',
				},
			},
			sites: {
				items,
			},
		},
		( state ) => state
	);
}
