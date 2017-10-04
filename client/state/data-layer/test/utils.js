/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { bypassDataLayer } from '../utils';

describe( 'Data Layer', () => {
	describe( '#local', () => {
		it( 'should wrap an action with the bypass flag', () => {
			const action = { type: 'ADD_SPLINE', id: 42 };
			const localAction = bypassDataLayer( action );

			expect( localAction ).to.have.deep.property( 'meta.dataLayer.doBypass', true );
		} );

		it( 'should not destroy existing meta', () => {
			const action = {
				type: 'SHAVE_THE_WHALES',
				meta: {
					oceanName: 'ARCTIC',
					dataLayer: {
						forceRefresh: true,
					},
				},
			};
			const localAction = bypassDataLayer( action );

			expect( localAction ).to.have.deep.property( 'meta.oceanName', 'ARCTIC' );
			expect( localAction ).to.have.deep.property( 'meta.dataLayer.forceRefresh', true );
		} );
	} );
} );
