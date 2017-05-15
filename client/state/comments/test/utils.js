/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	createRequestId,
} from '../utils';

describe( 'utils', () => {
	describe( '#createRequestId()', () => {
		it( 'should create the same id for differently ordered but same queries', () => {
			const props = [ 'first', 'second', 'third', 'fourth' ];
			let firstQuery = {};
			let secondQuery = {};

			props.forEach( ( prop ) => firstQuery[ prop ] = prop );
			props.reverse().forEach( ( prop ) => secondQuery[ prop ] = prop );

			const firstQueryId = createRequestId( 1, 1, firstQuery );
			const secondQueryId = createRequestId( 1, 1, secondQuery );

			expect( firstQueryId ).to.eql( secondQueryId );
		} );
	} );
} );
