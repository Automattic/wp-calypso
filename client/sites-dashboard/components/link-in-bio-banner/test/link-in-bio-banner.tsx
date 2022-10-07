/**
 * @jest-environment jsdom
 */
import * as viewport from '@automattic/viewport-react';
import { render, screen } from '@testing-library/react';
import each from 'jest-each';
import React from 'react';
import { Provider } from 'react-redux';
import { createReduxStore } from 'calypso/state/index';
import getSites from 'calypso/state/selectors/get-sites';
import { LinkInBioBanner } from '../link-in-bio-banner';
import { LINK_IN_BIO_BANNER_PREFERENCE } from '../link-in-bio-banner-parts';

describe( '<LinkInBioBanner>', () => {
	each( [
		//visible and right amount of rows - show
		[ true, 1, 'row', 'row-banner', true, false ],
		[ true, 1, 'grid', 'double-tile-banner', true, false ],
		[ true, 2, 'grid', 'tile-banner', true, false ],
		// dismissed but right amount of rows - don't show
		[ false, 1, 'row', 'row-banner', false, false ],
		[ false, 1, 'grid', 'double-tile-banner', false, false ],
		[ false, 2, 'grid', 'row-banner', false, false ],
		// visible but too many rows - don't show
		[ true, 2, 'row', 'row-banner', false, false ],
		[ true, 3, 'grid', 'double-tile-banner', false, false ],
		[ true, 3, 'grid', 'tile-banner', false, false ],
		// visible and right amount of rows but on mobile - always show tile-banner
		[ true, 1, 'row', 'tile-banner', true, true ],
		[ true, 1, 'grid', 'tile-banner', true, true ],
		[ true, 2, 'grid', 'tile-banner', true, true ],
		//visible and right amount of rows, but already has Link in Bio site - don't show
		[ true, 1, 'row', 'row-banner', false, false, 'link-in-bio' ],
	] ).test(
		'Parameters: visible: %s, site count: %s, type: %s, expectValue: %s, isMobile: %s, siteIntent: %s',
		( visible, siteCount, type, output, expectValue, isMobile, siteIntent = 'other' ) => {
			if ( isMobile ) {
				jest.spyOn( viewport, 'useMobileBreakpoint' ).mockReturnValue( true );
			}
			const store = createTestStore( visible, siteCount, siteIntent );
			const sites = getSites( store.getState() );
			render(
				<Provider store={ store }>
					<LinkInBioBanner sites={ sites } displayMode={ type } />
				</Provider>
			);
			if ( expectValue ) {
				// eslint-disable-next-line jest/no-standalone-expect
				expect( screen.getByTestId( output ) ).toBeInTheDocument();
			} else {
				// eslint-disable-next-line jest/no-standalone-expect
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
