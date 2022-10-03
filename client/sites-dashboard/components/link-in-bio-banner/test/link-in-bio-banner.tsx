/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import each from 'jest-each';
import React from 'react';
import { Provider } from 'react-redux';
import { createReduxStore } from 'calypso/state/index';
import { LinkInBioBanner } from '../link-in-bio-banner';
import { LINK_IN_BIO_BANNER_PREFERENCE } from '../link-in-bio-banner-parts';

describe( '<LinkInBioBanner>', () => {
	each( [
		// visible and right amount of rows - show
		[ true, 1, 'row', 'row-banner', true ],
		[ true, 1, 'grid', 'double-tile-banner', true ],
		[ true, 2, 'grid', 'tile-banner', true ],
		// dismissed but right amount of rows - don't show
		[ false, 1, 'row', 'row-banner', false ],
		[ false, 1, 'grid', 'double-tile-banner', false ],
		[ false, 2, 'grid', 'row-banner', false ],
		// visible but too many rows - don't show
		[ true, 2, 'row', 'row-banner', false ],
		[ true, 3, 'grid', 'double-tile-banner', false ],
		[ true, 3, 'grid', 'tile-banner', false ],
		// visible and right amount of rows but on mobile - show tile only
		// [ true, 1, 'row', 'tile-banner', true, 480 ],
		// [ true, 1, 'grid', 'tile-banner', true, 480 ],
		// [ true, 2, 'grid', 'tile-banner', true, 480 ],
	] ).test(
		'Parameters: visible: %s, site count: %s, type: %s',
		( visible, siteCount, type, output, expectValue ) => {
			render(
				<Provider store={ createTestStore( visible, siteCount ) }>
					<LinkInBioBanner siteCount={ siteCount } displayMode={ type } />
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

function createTestStore( visible: boolean, siteCount: number ) {
	const items: unknown = {};
	Array.from( { length: siteCount } ).forEach( ( value, index ) => {
		items[ `${ index }` ] = {
			URL: `test.com ${ index }`,
		};
	} );
	return createReduxStore(
		{
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
