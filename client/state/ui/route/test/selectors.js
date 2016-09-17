/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getParam } from '../selectors';

describe( 'selectors', () => {
	describe( '#getParams()', () => {
		it( 'should return an empty string if the param cannot be found', () => {
			const param = getParam( {
				ui: {
					route: {
						params: { foo: 'bar' }
					}
				}
			}, 'spam' );

			expect( param ).to.be.empty;
		} );

		it( 'should return the route\'s params', () => {
			const param = getParam( {
				ui: {
					route: {
						params: { foo: 'bar' }
					}
				}
			}, 'foo' );

			expect( param ).to.eql( 'bar' );
		} );
	} );
} );
