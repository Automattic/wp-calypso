import { getBlockedSites } from 'calypso/state/reader/site-blocks/selectors';

describe( 'getBlockedSites()', () => {
	test( 'should return an array of blocked site IDs', () => {
		const state = {
			reader: {
				siteBlocks: {
					items: {
						123: true,
						124: false,
						125: true,
					},
				},
			},
		};
		expect( getBlockedSites( state ) ).toEqual( [ 123, 125 ] );
	} );
} );
