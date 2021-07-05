/**
 * External dependencies
 */
import { YOAST_PREMIUM, YOAST_FREE } from '@automattic/calypso-products';

/**
 * Internal dependencies
 */
import { getIsPluginInstalledDuringPurchase } from 'calypso/state/marketplace/purchase-flow/selectors';
import { defaultState } from 'calypso/state/marketplace/purchase-flow/reducer';
import { YOAST } from 'calypso/my-sites/marketplace/types';

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

		const test1StateWithoutProductGroup = {
			...defaultTestSuiteState,
			marketplace: {
				purchaseFlow: {
					...defaultState,
					productSlugInstalled: YOAST_FREE,
				},
			},
		};
		result = getIsPluginInstalledDuringPurchase( test1StateWithoutProductGroup );
		expect( result ).toEqual( null );

		const test2StateWithNonExistentProduct = {
			...defaultTestSuiteState,
			marketplace: {
				purchaseFlow: {
					...defaultState,
					productSlugInstalled: 'A_PRODUCT_THAT_DOES_NOT_EXIST',
				},
			},
		};
		result = getIsPluginInstalledDuringPurchase( test2StateWithNonExistentProduct );
		expect( result ).toEqual( null );
	} );

	test( 'When a free plugin is installed getIsPluginInstalledDuringPurchase selector should return false', () => {
		const testState = {
			...defaultTestSuiteState,
			marketplace: {
				purchaseFlow: {
					...defaultState,
					productGroupSlug: YOAST,
					productSlugInstalled: YOAST_FREE,
				},
			},
		};
		const result = getIsPluginInstalledDuringPurchase( testState );

		expect( result ).toEqual( false );
	} );

	test( 'When a paid plugin is installed getIsPluginInstalledDuringPurchase selector should return true', () => {
		const testState = {
			...defaultTestSuiteState,
			marketplace: {
				purchaseFlow: {
					...defaultState,
					productGroupSlug: YOAST,
					productSlugInstalled: YOAST_PREMIUM,
				},
			},
		};
		const result = getIsPluginInstalledDuringPurchase( testState );

		expect( result ).toEqual( true );
	} );
} );
