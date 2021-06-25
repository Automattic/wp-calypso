/**
 * Internal dependencies
 */
import { getSiteBlocksCurrentPage } from 'calypso/state/reader/site-blocks/selectors';

describe( 'getSiteBlocksCurrentPage()', () => {
	test( 'should return the current page', () => {
		const prevState = {
			reader: {
				siteBlocks: {
					currentPage: 4,
				},
			},
		};
		const nextState = getSiteBlocksCurrentPage( prevState );
		expect( nextState ).toEqual( 4 );
	} );

	test( 'should return 1 if there is no current page', () => {
		const prevState = {
			reader: {
				siteBlocks: {
					currentPage: null,
				},
			},
		};
		const nextState = getSiteBlocksCurrentPage( prevState );
		expect( nextState ).toEqual( 1 );
	} );
} );
