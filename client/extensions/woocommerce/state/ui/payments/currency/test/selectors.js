/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getCurrencyWithEdits } from '../selectors';

const uiState = {
	currency: '',
};

const state = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						general: [
							{
								id: 'woocommerce_currency',
								value: 'USD',
							},
						],
					},
				},
			},
			ui: {
				payments: {
					123: uiState,
				},
			},
		},
	},
	ui: {
		selectedSiteId: 123,
	},
};

describe( 'selectors', () => {
	describe( 'getCurrencyWithEdits', () => {
		test( 'should return currency from sites state if no edits', () => {
			expect( getCurrencyWithEdits( state, 123 ) ).to.deep.equal( 'USD' );
		} );

		test( 'should return currency from ui state if edits', () => {
			uiState.currency = 'WAS';
			expect( getCurrencyWithEdits( state, 123 ) ).to.deep.equal( 'WAS' );
		} );
	} );
} );
