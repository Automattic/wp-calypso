import { YOAST_PREMIUM, YOAST_FREE } from '@automattic/calypso-products';
import { IPurchaseFlowState } from 'state/marketplace/types';
import { YOAST } from 'calypso/my-sites/marketplace/marketplace-product-definitions';
import { defaultState } from 'calypso/state/marketplace/purchase-flow/reducer';
import { getIsPluginInstalledDuringPurchase } from 'calypso/state/marketplace/purchase-flow/selectors';

describe( 'Purchase Flow selectors test suite', () => {
	const defaultTestSuiteState = {
		marketplace: {
			purchaseFlow: {
				...defaultState,
			},
		},
	};
	test( 'The default or invalid state should return null', () => {
		let result = getIsPluginInstalledDuringPurchase( defaultTestSuiteState );
		expect( result ).toEqual( null );
		let purchaseFlow: IPurchaseFlowState = {
			...defaultState,
			productSlugInstalled: YOAST_FREE,
		};
		const test1StateWithoutProductGroup = {
			...defaultTestSuiteState,
			marketplace: {
				purchaseFlow,
			},
		};
		result = getIsPluginInstalledDuringPurchase( test1StateWithoutProductGroup );
		expect( result ).toEqual( null );
		purchaseFlow = {
			...defaultState,
			productSlugInstalled: 'A_PRODUCT_THAT_DOES_NOT_EXIST',
		};
		const test2StateWithNonExistentProduct = {
			...defaultTestSuiteState,
			marketplace: {
				purchaseFlow,
			},
		};
		result = getIsPluginInstalledDuringPurchase( test2StateWithNonExistentProduct );
		expect( result ).toEqual( null );
	} );

	test( 'When a free plugin is installed getIsPluginInstalledDuringPurchase selector should return false', () => {
		const purchaseFlow: IPurchaseFlowState = {
			...defaultState,
			productGroupSlug: YOAST,
			productSlugInstalled: YOAST_FREE,
		};
		const testState = {
			...defaultTestSuiteState,
			marketplace: {
				purchaseFlow,
			},
		};
		const result = getIsPluginInstalledDuringPurchase( testState );

		expect( result ).toEqual( false );
	} );

	test( 'When a paid plugin is installed getIsPluginInstalledDuringPurchase selector should return true', () => {
		const purchaseFlow: IPurchaseFlowState = {
			...defaultState,
			productGroupSlug: YOAST,
			productSlugInstalled: YOAST_PREMIUM,
		};
		const testState = {
			...defaultTestSuiteState,
			marketplace: {
				purchaseFlow,
			},
		};
		const result = getIsPluginInstalledDuringPurchase( testState );

		expect( result ).toEqual( true );
	} );
} );
