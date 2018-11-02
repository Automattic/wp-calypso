/** @format */

/**
 * Internal dependencies
 */
import isFetchingSiteBlocks from 'state/selectors/is-fetching-site-blocks';

describe( 'isFetchingSiteBlocks()', () => {
	test( 'should return true if there is a fetch in progress', () => {
		const prevState = {
			reader: {
				siteBlocks: {
					inflightPages: { 2: true },
				},
			},
		};
		const nextState = isFetchingSiteBlocks( prevState );
		expect( nextState ).toEqual( true );
	} );

	test( 'should return false if there is not a fetch in progress', () => {
		const prevState = {
			reader: {
				siteBlocks: {
					inflightPages: {},
				},
			},
		};
		const nextState = isFetchingSiteBlocks( prevState );
		expect( nextState ).toEqual( false );
	} );
} );
