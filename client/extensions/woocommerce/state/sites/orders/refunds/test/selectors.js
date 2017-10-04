/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isOrderRefunding } from '../selectors';

const preInitializedState = {
	extensions: {
		woocommerce: {},
	},
};
const loadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					orders: {
						refunds: {
							isSaving: {
								20: true,
							},
						},
					},
				},
			},
		},
	},
};
const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					orders: {
						refunds: {
							isSaving: {
								20: false,
							},
						},
					},
				},
			},
		},
	},
};
const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#isOrderRefunding', () => {
		it( 'should be false when woocommerce state is not available.', () => {
			expect( isOrderRefunding( preInitializedState, 20, 123 ) ).to.be.false;
		} );

		it( 'should be true when the order refund is requested.', () => {
			expect( isOrderRefunding( loadingState, 20, 123 ) ).to.be.true;
		} );

		it( 'should be false when this order refund is completed.', () => {
			expect( isOrderRefunding( loadedState, 20, 123 ) ).to.be.false;
		} );

		it( 'should get the siteId from the UI tree if not provided.', () => {
			expect( isOrderRefunding( loadedStateWithUi, 20 ) ).to.be.false;
		} );
	} );
} );
