/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isDevelopment } from '../utils';

describe( 'utils', () => {
	context( '#isDevelopment', () => {
		it( 'should return false when no development string provided', () => {
			expect( isDevelopment( 'test' ) ).to.be.false;
		} );

		it( 'should return true when string provided equals development', () => {
			expect( isDevelopment( 'development' ) ).to.be.true;
		} );
	} );
} );
