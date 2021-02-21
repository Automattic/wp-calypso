/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPreviousQuery from 'calypso/state/selectors/get-previous-query';

describe( 'getPreviousQuery()', () => {
	test( 'should return empty if the previous Route is not set', () => {
		const stateIn = {};
		const output = getPreviousQuery( stateIn );
		expect( output ).to.eql( '' );
	} );

	test( 'should return previous query if one is found', () => {
		const stateIn = {
			route: {
				query: {
					previous: { filter: 'howdy' },
				},
			},
		};
		const output = getPreviousQuery( stateIn );
		expect( output.filter ).to.eql( 'howdy' );
	} );
} );
