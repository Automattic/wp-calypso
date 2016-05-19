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

		it( 'should return false when string provided does not end with development', () => {
			expect( isDevelopment( 'development-test' ) ).to.be.false;
		} );

		it( 'should return true when string provides equals development', () => {
			expect( isDevelopment( 'development' ) ).to.be.true;
		} );

		it( 'should return true when string provided ends with development', () => {
			expect( isDevelopment( 'test-development' ) ).to.be.true;
		} );
	} );
} );
