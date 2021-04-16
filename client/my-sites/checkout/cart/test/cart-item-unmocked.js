/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { identity } from 'lodash';

/**
 * Internal dependencies
 */
import { CartItem } from '../cart-item';
import {
	PLAN_BUSINESS_2_YEARS,
	PLAN_JETPACK_PERSONAL,
	PLAN_PERSONAL,
	PLAN_BLOGGER,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';

jest.mock( '@automattic/calypso-config', () => {
	const fn = () => {};
	fn.isEnabled = jest.fn( () => null );
	return fn;
} );
jest.mock( '@automattic/format-currency', () => ( {
	getCurrencyObject: ( price ) => ( { integer: price } ),
} ) );
jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	isPlan: jest.fn( () => null ),
	isTheme: jest.fn( () => null ),
	isMonthly: jest.fn( () => null ),
	isYearly: jest.fn( () => null ),
	isBiennially: jest.fn( () => null ),
	isBundled: jest.fn( () => null ),
	isDomainProduct: jest.fn( () => null ),
	isCredits: jest.fn( () => null ),
	isGSuiteOrExtraLicenseOrGoogleWorkspace: jest.fn( () => null ),
} ) );

const cartItem = {
	cost: 120,
	bill_period: 1,
	volume: 1,
	product_name: 'name!',
	product_slug: 'plan_value_bundle',
};

const translate = jest.fn( identity );
const props = {
	cartItem,
	translate,
};

describe( 'cart-item', () => {
	describe( 'calcMonthlyBillingDetails - real callbacks', () => {
		const expectations = [
			[
				{ product_slug: PLAN_BLOGGER, cost: 60 },
				{ months: 12, monthlyPrice: 5 },
			],
			[
				{ product_slug: PLAN_PERSONAL, cost: 120 },
				{ months: 12, monthlyPrice: 10 },
			],
			[
				{ product_slug: PLAN_PREMIUM, cost: 180 },
				{ months: 12, monthlyPrice: 15 },
			],
			[
				{ product_slug: PLAN_BUSINESS_2_YEARS, cost: 480 },
				{ months: 24, monthlyPrice: 20 },
			],
			[
				{ product_slug: PLAN_JETPACK_PERSONAL, cost: 288 },
				{ months: 12, monthlyPrice: 24 },
			],
		];

		test.each( expectations )( 'Returns correct values for annual plan', ( input, output ) => {
			const instance = new CartItem( {
				...props,
				cartItem: {
					...cartItem,
					...input,
				},
			} );
			expect( instance.calcMonthlyBillingDetails() ).toEqual( output );
		} );

		test( 'Throws an error for an unknown plan', () => {
			const instance = new CartItem( {
				...props,
				cartItem: {
					...cartItem,
					product_slug: 'fake',
				},
			} );
			expect( () => instance.calcMonthlyBillingDetails() ).toThrow();
		} );
	} );
} );
