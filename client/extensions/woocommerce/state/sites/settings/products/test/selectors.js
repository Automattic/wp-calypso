/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	areSettingsProductsLoaded,
	areSettingsProductsLoading,
	getWeightUnitSetting,
	getDimensionsUnitSetting,
	getProductsSettingValue,
} from '../selectors';
import { LOADING } from 'woocommerce/state/constants';

const preInitializedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						products: null,
					},
				},
			},
		},
	},
};
const loadingState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						products: LOADING,
					},
				},
			},
		},
	},
};
const weightUnitSetting = {
	id: 'woocommerce_weight_unit',
	label: 'Weight unit',
	type: 'select',
	default: 'kg',
	value: 'lbs',
};
const dimensionsUnitSetting = {
	id: 'woocommerce_dimension_unit',
	label: 'Dimensions unit',
	type: 'select',
	default: 'cm',
	value: 'in',
};

const notifyLowStockSetting = {
	id: 'woocommerce_notify_low_stock',
	description: 'Enable low stock notifications',
	label: 'Notifications',
	type: 'checkbox',
	value: 'yes',
};

const lowStockAmountSetting = {
	id: 'woocommerce_notify_low_stock_amount',
	description: 'When product stock reaches this amount you will be notified via email.',
	label: 'Low stock threshold',
	type: 'number',
	value: '2',
};

const notifyNoStockSetting = {
	id: 'woocommerce_notify_no_stock',
	description: 'Enable out of stock notifications',
	label: '',
	type: 'checkbox',
	value: 'no',
};

const manageStockSetting = {
	id: 'woocommerce_manage_stock',
	description: 'Enable stock management',
	label: 'Manage stock',
	type: 'checkbox',
	value: 'yes',
};

const loadedState = {
	extensions: {
		woocommerce: {
			sites: {
				123: {
					settings: {
						products: [
							dimensionsUnitSetting,
							lowStockAmountSetting,
							manageStockSetting,
							notifyLowStockSetting,
							notifyNoStockSetting,
							weightUnitSetting,
						],
					},
				},
			},
		},
	},
};

const loadingStateWithUi = { ...loadingState, ui: { selectedSiteId: 123 } };
const loadedStateWithUi = { ...loadedState, ui: { selectedSiteId: 123 } };

describe( 'selectors', () => {
	describe( '#areSettingsProductsLoaded', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areSettingsProductsLoaded( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when products settings are currently being fetched.', () => {
			expect( areSettingsProductsLoaded( loadingState, 123 ) ).to.be.false;
		} );

		test( 'should be true when products settings are loaded.', () => {
			expect( areSettingsProductsLoaded( loadedState, 123 ) ).to.be.true;
		} );

		test( 'should be false when products settings are loaded only for a different site.', () => {
			expect( areSettingsProductsLoaded( loadedState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areSettingsProductsLoaded( loadingStateWithUi ) ).to.be.false;
		} );
	} );

	describe( '#areSettingsProductsLoading', () => {
		test( 'should be false when woocommerce state is not available.', () => {
			expect( areSettingsProductsLoading( preInitializedState, 123 ) ).to.be.false;
		} );

		test( 'should be true when products settings are currently being fetched.', () => {
			expect( areSettingsProductsLoading( loadingState, 123 ) ).to.be.true;
		} );

		test( 'should be false when products settings are loaded.', () => {
			expect( areSettingsProductsLoading( loadedState, 123 ) ).to.be.false;
		} );

		test( 'should be false when products settings are loaded only for a different site.', () => {
			expect( areSettingsProductsLoading( loadedState, 456 ) ).to.be.false;
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( areSettingsProductsLoading( loadingStateWithUi ) ).to.be.true;
		} );
	} );

	describe( '#getWeightUnitSetting', () => {
		test( 'should get the weight unit setting from the state.', () => {
			expect( getWeightUnitSetting( loadedState, 123 ) ).to.eql( weightUnitSetting );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getWeightUnitSetting( loadedStateWithUi ) ).to.eql( weightUnitSetting );
		} );
	} );

	describe( '#getDimensionsUnitSetting', () => {
		test( 'should get the dimensions unit setting from the state.', () => {
			expect( getDimensionsUnitSetting( loadedState, 123 ) ).to.eql( dimensionsUnitSetting );
		} );

		test( 'should get the siteId from the UI tree if not provided.', () => {
			expect( getDimensionsUnitSetting( loadedStateWithUi ) ).to.eql( dimensionsUnitSetting );
		} );
	} );

	describe( '#getProductsSettingValue', () => {
		test( 'should be null when woocommerce state is not available', () => {
			expect(
				getProductsSettingValue( preInitializedState, 'woocommerce_notify_low_stock_amount', 123 )
			).to.be.null;
		} );

		test( 'should be null when woocommerce state is available but setting key is invalid', () => {
			expect( getProductsSettingValue( loadedState, 'not-a-valid-key', 123 ) ).to.be.null;
		} );

		test( 'should return correct woocommerce_notify_low_stock_amount', () => {
			expect(
				getProductsSettingValue( loadedState, 'woocommerce_notify_low_stock_amount', 123 )
			).to.equal( '2' );
		} );

		test( 'should return correct woocommerce_notify_low_stock', () => {
			expect(
				getProductsSettingValue( loadedStateWithUi, 'woocommerce_notify_low_stock' )
			).to.equal( 'yes' );
		} );

		test( 'should return correct woocommerce_notify_no_stock', () => {
			expect( getProductsSettingValue( loadedState, 'woocommerce_notify_no_stock', 123 ) ).to.equal(
				'no'
			);
		} );

		test( 'should return correct woocommerce_manage_stock', () => {
			expect( getProductsSettingValue( loadedStateWithUi, 'woocommerce_manage_stock' ) ).to.equal(
				'yes'
			);
		} );
	} );
} );
