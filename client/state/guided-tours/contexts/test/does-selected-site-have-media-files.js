/**
 * Internal dependencies
 */
import { doesSelectedSiteHaveMediaFiles } from '../does-selected-site-have-media-files';
import MediaQueryManager from 'calypso/lib/query-manager/media/index.js';

describe( 'doesSelectedSiteHaveMediaFiles', () => {
	test( '1 + 1 = 2', () => {
		expect( 1 + 1 ).toBe( 2 );
	} );

	test( 'should return false if no site is selected', () => {
		const state = {
			ui: {
				selectedSiteId: null,
			},
		};

		expect( doesSelectedSiteHaveMediaFiles( state ) ).toBe( false );
	} );

	test( 'should return falsy value if selected site has no media items', () => {
		const state = {
			ui: {
				selectedSiteId: 123456,
			},
			media: {
				queries: {
					123456: new MediaQueryManager(),
				},
			},
		};

		expect( doesSelectedSiteHaveMediaFiles( state ) ).toBeFalsy();
	} );

	test( 'should return true if selected site has media items', () => {
		const queryManager = new MediaQueryManager().receive( [
			{
				ID: 42,
				title: 'arbitrary media item',
			},
		] );
		const state = {
			ui: {
				selectedSiteId: 123456,
			},
			media: {
				queries: {
					123456: queryManager,
				},
			},
		};

		expect( doesSelectedSiteHaveMediaFiles( state ) ).toBe( true );
	} );
} );
