/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getPreviousPath from 'calypso/state/selectors/get-previous-path';

describe( 'getPreviousPath()', () => {
	test( 'should return empty if the previous path is not set', () => {
		const stateIn = {};
		const output = getPreviousPath( stateIn );
		expect( output ).to.eql( '' );
	} );

	test( 'should return previous path if one is found', () => {
		const stateIn = {
			route: {
				path: {
					previous: '/hello',
				},
			},
		};
		const output = getPreviousPath( stateIn );
		expect( output ).to.eql( '/hello' );
	} );
} );
