/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { areCurrenciesLoaded, areCurrenciesLoading, getCurrencies } from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

const currencies = [
	{ code: 'AED', name: 'United Arab Emirates dirham', symbol: '&#x62f;.&#x625;' },
	{ code: 'AFN', name: 'Afghan afghani', symbol: '&#x60b;' },
];

const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					data: { currencies },
				},
			},
		},
	},
	ui: {
		selectedSiteId: 123,
	},
};

const loadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					data: { currencies: LOADING },
				},
			},
		},
	},
	ui: {
		selectedSiteId: 123,
	},
};

const emptyState = {
	extensions: {
		woocommerce: {},
	},
	ui: {
		selectedSiteId: 123,
	},
};

describe( 'selectors', () => {
	describe( '#areCurrenciesLoaded', () => {
		test( 'should return false when woocommerce state is not available.', () => {
			expect( areCurrenciesLoaded( emptyState, 123 ) ).to.be.false;
		} );

		test( 'should return true when currencies are loaded.', () => {
			expect( areCurrenciesLoaded( loadedState, 123 ) ).to.be.true;
		} );

		test( 'should return false when currencies are currently being fetched.', () => {
			expect( areCurrenciesLoaded( loadingState, 123 ) ).to.be.false;
		} );

		test( 'should return false when currencies are loaded only for a different site.', () => {
			expect( areCurrenciesLoaded( loadedState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areCurrenciesLoaded( loadedState ) ).to.be.true;
		} );
	} );

	describe( '#areCurrenciesLoading', () => {
		test( 'should return false when woocommerce state is not available.', () => {
			expect( areCurrenciesLoading( emptyState, 123 ) ).to.be.false;
		} );

		test( 'should return false when currencies are loaded.', () => {
			expect( areCurrenciesLoading( loadedState, 123 ) ).to.be.false;
		} );

		test( 'should return true when currencies are currently being fetched.', () => {
			expect( areCurrenciesLoading( loadingState, 123 ) ).to.be.true;
		} );

		test( 'should return false when currencies are loaded only for a different site.', () => {
			expect( areCurrenciesLoading( loadingState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areCurrenciesLoading( loadingState ) ).to.be.true;
		} );
	} );

	describe( '#getCurrencies', () => {
		test( 'should return an empty list if the currencies are not loaded', () => {
			expect( getCurrencies( emptyState ) ).to.deep.equal( [] );
		} );

		test( 'should return an empty list if the currencies are being loaded', () => {
			expect( getCurrencies( loadingState ) ).to.deep.equal( [] );
		} );

		test( 'should return the currencies', () => {
			expect( getCurrencies( loadedState ) ).to.deep.equal( [
				{ code: 'AED', name: 'United Arab Emirates dirham', symbol: '&#x62f;.&#x625;' },
				{ code: 'AFN', name: 'Afghan afghani', symbol: '&#x60b;' },
			] );
		} );
	} );
} );
