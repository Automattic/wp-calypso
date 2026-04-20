/**
 * @jest-environment jsdom
 */

import {
	getProductCategory,
	getCancellationHeading,
	getTopNoticeCopy,
	getCheckboxLabel,
	getButtonLabels,
	getFallbackLossItems,
} from '../get-confirmation-copy';
import type { Purchase } from '@automattic/api-core';

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		product_name: 'WordPress.com Business',
		product_slug: 'business-bundle',
		is_plan: true,
		is_domain_registration: false,
		is_jetpack_plan_or_product: false,
		expiry_status: 'auto-renewing',
		meta: '',
		domain: 'example.com',
		product_type: '',
		...overrides,
	} as Purchase;
}

const DATE = 'April 16, 2027';

describe( 'getProductCategory', () => {
	test( 'plan', () => {
		expect( getProductCategory( makePurchase( { is_plan: true } ) ) ).toBe( 'plan' );
	} );
	test( 'domain', () => {
		expect(
			getProductCategory(
				makePurchase( { is_plan: false, is_domain_registration: true, product_slug: 'domain_reg' } )
			)
		).toBe( 'domain' );
	} );
	test( 'email (Titan)', () => {
		expect(
			getProductCategory(
				makePurchase( { is_plan: false, product_slug: 'wp_titan_mail_monthly' } )
			)
		).toBe( 'email' );
	} );
	test( 'email (Google Workspace)', () => {
		expect( getProductCategory( makePurchase( { is_plan: false, product_slug: 'gapps' } ) ) ).toBe(
			'email'
		);
	} );
	test( 'akismet', () => {
		expect(
			getProductCategory( makePurchase( { is_plan: false, product_slug: 'ak_plus_yearly_1' } ) )
		).toBe( 'akismet' );
	} );
	test( 'jetpack', () => {
		expect(
			getProductCategory(
				makePurchase( {
					is_plan: false,
					is_jetpack_plan_or_product: true,
					product_slug: 'jetpack_security_daily',
				} )
			)
		).toBe( 'jetpack' );
	} );
	test( 'marketplace', () => {
		expect(
			getProductCategory(
				makePurchase( {
					is_plan: false,
					product_type: 'marketplace_plugin',
				} as Partial< Purchase > )
			)
		).toBe( 'marketplace' );
	} );
	test( 'one-time', () => {
		expect(
			getProductCategory( makePurchase( { is_plan: false, expiry_status: 'one-time-purchase' } ) )
		).toBe( 'one-time' );
	} );
} );

describe( 'getCancellationHeading', () => {
	test.each( [
		[ 'plan', 'Cancel plan', 'Remove plan' ],
		[ 'domain', 'Cancel domain', 'Remove domain' ],
		[ 'email', 'Cancel email', 'Remove email' ],
		[ 'one-time', 'Cancel purchase', 'Remove purchase' ],
		[ 'other', 'Cancel subscription', 'Remove subscription' ],
	] )( '%s variant', ( category, cancelHeading, removeHeading ) => {
		const purchase = makePurchaseForCategory( category );
		expect(
			getCancellationHeading( { purchase, intent: 'cancel', expiryDateFormatted: DATE } )
		).toBe( cancelHeading );
		expect(
			getCancellationHeading( { purchase, intent: 'remove', expiryDateFormatted: DATE } )
		).toBe( removeHeading );
	} );
} );

describe( 'getTopNoticeCopy', () => {
	test( 'returns null for Remove intent', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchase(),
				intent: 'remove',
				expiryDateFormatted: DATE,
			} )
		).toBeNull();
	} );
	test( 'returns null with no expiry date', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchase(),
				intent: 'cancel',
				expiryDateFormatted: '',
			} )
		).toBeNull();
	} );
	test( 'plan', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchaseForCategory( 'plan' ),
				intent: 'cancel',
				expiryDateFormatted: DATE,
			} )
		).toBe( `Your plan is active until ${ DATE }.` );
	} );
	test( 'domain', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchaseForCategory( 'domain' ),
				intent: 'cancel',
				expiryDateFormatted: DATE,
			} )
		).toBe( `Your domain is active until ${ DATE }.` );
	} );
	test( 'email', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchaseForCategory( 'email' ),
				intent: 'cancel',
				expiryDateFormatted: DATE,
			} )
		).toBe( `Your email is active until ${ DATE }.` );
	} );
	test( 'one-time returns null (no meaningful date)', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchaseForCategory( 'one-time' ),
				intent: 'cancel',
				expiryDateFormatted: DATE,
			} )
		).toBeNull();
	} );
	test( 'jetpack uses productName fallback', () => {
		const purchase = makePurchaseForCategory( 'jetpack', { product_name: 'Jetpack Security' } );
		expect( getTopNoticeCopy( { purchase, intent: 'cancel', expiryDateFormatted: DATE } ) ).toBe(
			`Your Jetpack Security subscription is active until ${ DATE }.`
		);
	} );
} );

describe( 'getCheckboxLabel', () => {
	test( 'cancel variant includes the expiry date', () => {
		expect(
			getCheckboxLabel( {
				purchase: makePurchaseForCategory( 'plan' ),
				intent: 'cancel',
				expiryDateFormatted: DATE,
			} )
		).toBe( `I understand my plan will expire on ${ DATE }.` );
	} );
	test( 'remove variant omits the date', () => {
		expect(
			getCheckboxLabel( {
				purchase: makePurchaseForCategory( 'plan' ),
				intent: 'remove',
				expiryDateFormatted: DATE,
			} )
		).toBe( 'I understand my plan will be removed immediately.' );
	} );
	test( 'cancel + no expiry falls back to generic copy', () => {
		expect(
			getCheckboxLabel( {
				purchase: makePurchaseForCategory( 'one-time' ),
				intent: 'cancel',
				expiryDateFormatted: '',
			} )
		).toBe( 'I understand my subscription will be cancelled.' );
	} );
} );

describe( 'getButtonLabels', () => {
	test( 'cancel plan', () => {
		expect(
			getButtonLabels( { purchase: makePurchaseForCategory( 'plan' ), intent: 'cancel' } )
		).toEqual( { primary: 'Cancel plan', secondary: 'Keep plan' } );
	} );
	test( 'remove domain', () => {
		expect(
			getButtonLabels( { purchase: makePurchaseForCategory( 'domain' ), intent: 'remove' } )
		).toEqual( { primary: 'Remove domain', secondary: 'Keep domain' } );
	} );
	test( 'other (subscription) cancel', () => {
		expect(
			getButtonLabels( { purchase: makePurchaseForCategory( 'jetpack' ), intent: 'cancel' } )
		).toEqual( { primary: 'Cancel subscription', secondary: 'Keep subscription' } );
	} );
} );

describe( 'getFallbackLossItems', () => {
	test( 'plan', () => {
		expect(
			getFallbackLossItems(
				makePurchaseForCategory( 'plan', { product_name: 'WordPress.com Business' } )
			)
		).toEqual( [ 'All WordPress.com Business features' ] );
	} );
	test( 'domain uses meta (domain name)', () => {
		expect(
			getFallbackLossItems(
				makePurchaseForCategory( 'domain', { meta: 'mydomain.com' } as Partial< Purchase > )
			)
		).toEqual( [ 'Your domain at mydomain.com' ] );
	} );
	test( 'email (Titan)', () => {
		expect( getFallbackLossItems( makePurchaseForCategory( 'email' ) ) ).toEqual( [
			'Your professional email accounts',
		] );
	} );
	test( 'email (Google Workspace)', () => {
		expect(
			getFallbackLossItems( makePurchase( { is_plan: false, product_slug: 'gapps' } ) )
		).toEqual( [ 'Your Google Workspace accounts' ] );
	} );
	test( 'akismet', () => {
		expect( getFallbackLossItems( makePurchaseForCategory( 'akismet' ) ) ).toEqual( [
			'Akismet spam protection',
		] );
	} );
	test( 'jetpack', () => {
		expect(
			getFallbackLossItems(
				makePurchaseForCategory( 'jetpack', { product_name: 'Jetpack Security' } )
			)
		).toEqual( [ 'Jetpack Security protection' ] );
	} );
	test( 'one-time returns the product name directly', () => {
		expect(
			getFallbackLossItems(
				makePurchaseForCategory( 'one-time', { product_name: 'Do it for me: Website Design' } )
			)
		).toEqual( [ 'Do it for me: Website Design' ] );
	} );
} );

/**
 * Builds a purchase that `getProductCategory` will classify into the given
 * bucket. Used to keep the per-category test cases legible.
 */
function makePurchaseForCategory(
	category: string,
	overrides: Partial< Purchase > = {}
): Purchase {
	switch ( category ) {
		case 'plan':
			return makePurchase( { is_plan: true, ...overrides } );
		case 'domain':
			return makePurchase( {
				is_plan: false,
				is_domain_registration: true,
				product_slug: 'domain_reg',
				...overrides,
			} );
		case 'email':
			return makePurchase( {
				is_plan: false,
				product_slug: 'wp_titan_mail_monthly',
				...overrides,
			} );
		case 'akismet':
			return makePurchase( {
				is_plan: false,
				product_slug: 'ak_plus_yearly_1',
				...overrides,
			} );
		case 'jetpack':
			return makePurchase( {
				is_plan: false,
				is_jetpack_plan_or_product: true,
				product_slug: 'jetpack_security_daily',
				...overrides,
			} );
		case 'marketplace':
			return makePurchase( {
				is_plan: false,
				product_type: 'marketplace_plugin',
				...overrides,
			} as Partial< Purchase > );
		case 'one-time':
			return makePurchase( {
				is_plan: false,
				expiry_status: 'one-time-purchase',
				...overrides,
			} );
		case 'other':
			return makePurchase( {
				is_plan: false,
				product_slug: 'some_other_subscription',
				...overrides,
			} );
		default:
			throw new Error( `Unknown category: ${ category }` );
	}
}
