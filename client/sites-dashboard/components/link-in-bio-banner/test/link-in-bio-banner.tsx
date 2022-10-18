/**
 * @jest-environment jsdom
 */
import * as viewport from '@automattic/viewport-react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { createReduxStore } from 'calypso/state/index';
import { LinkInBioBanner } from '../link-in-bio-banner';
import { LINK_IN_BIO_BANNER_PREFERENCE } from '../link-in-bio-banner-parts';

describe( '<LinkInBioBanner>', () => {
	test.each( [
		//visible and right amount of rows - show
		[ true, 1, 'row', 'row-banner', true, false, true ],
		[ true, 1, 'grid', 'double-tile-banner', true, false, true ],
		[ true, 2, 'grid', 'tile-banner', true, false, true ],
		// dismissed but right amount of rows - don't show
		[ false, 1, 'row', 'row-banner', false, false, true ],
		[ false, 1, 'grid', 'double-tile-banner', false, false, true ],
		[ false, 2, 'grid', 'row-banner', false, false, true ],
		// visible but too many rows - don't show
		[ true, 2, 'row', 'row-banner', false, false, true ],
		[ true, 3, 'grid', 'double-tile-banner', false, false, true ],
		[ true, 3, 'grid', 'tile-banner', false, false, true ],
		// visible and right amount of rows but on mobile - always show tile-banner
		[ true, 1, 'row', 'tile-banner', true, true, false ],
		[ true, 1, 'grid', 'tile-banner', true, true, false ],
		[ true, 2, 'grid', 'tile-banner', true, false, true ],
		//visible and right amount of rows, but already has Link in Bio site - don't show
		[ true, 1, 'row', 'row-banner', false, false, true, 'link-in-bio' ],
		// should output tile-banner but not enough space - don't show
		[ true, 2, 'grid', 'tile-banner', false, false, false ],
		// should be double-tile-banner but space is right - show tile0-banner
		[ true, 1, 'grid', 'tile-banner', true, false, false ],
	] )(
		'Parameters: visible: %s, site count: %s, type: %s, output: %s, expectValue: %s, isMobile: %s, isDesktop: %s, siteIntent: %s',
		(
			visible,
			siteCount,
			type,
			output,
			expectValue,
			isMobile,
			isDesktop,
			siteIntent = 'other'
		) => {
			jest.spyOn( viewport, 'useMobileBreakpoint' ).mockReturnValue( isMobile );
			jest.spyOn( viewport, 'useDesktopBreakpoint' ).mockReturnValue( isDesktop );

			const store = createTestStore( visible, siteCount, siteIntent );
			const queryClient = new QueryClient();

			render(
				<QueryClientProvider client={ queryClient }>
					<Provider store={ store }>
						<LinkInBioBanner displayMode={ type } />
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

function createTestStore( visible: boolean, siteCount: number, site_intent: string ) {
	const items: unknown = {};

	Array.from( { length: siteCount } ).forEach( ( value, index ) => {
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
			preferences: {
				remoteValues: {
					[ LINK_IN_BIO_BANNER_PREFERENCE ]: visible,
				},
			},
			sites: {
				items,
			},
		},
		( state ) => {
			return state;
		}
	);
}
