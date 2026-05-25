/**
 * @jest-environment jsdom
 */

import {
	formatTimeRemaining,
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
		expiry_date: '2027-04-16T00:00:00+00:00',
		meta: '',
		domain: 'example.com',
		product_type: '',
		...overrides,
	} as Purchase;
}

const NOW = new Date( '2027-03-05T00:00:00+00:00' ); // 1 month and 11 days before the default expiry

describe( 'formatTimeRemaining', () => {
	test( 'months + days', () => {
		expect( formatTimeRemaining( '2027-04-16T00:00:00Z', NOW ) ).toBe( '1 month and 11 days' );
	} );
	test( 'only days', () => {
		expect( formatTimeRemaining( '2027-03-19T00:00:00Z', NOW ) ).toBe( '14 days' );
	} );
	test( 'only months', () => {
		expect( formatTimeRemaining( '2027-06-05T00:00:00Z', NOW ) ).toBe( '3 months' );
	} );
	test( 'years + months (days omitted past the one-year mark)', () => {
		expect( formatTimeRemaining( '2029-06-05T00:00:00Z', NOW ) ).toBe( '2 years and 3 months' );
	} );
	test( 'singular units', () => {
		expect( formatTimeRemaining( '2027-04-06T00:00:00Z', NOW ) ).toBe( '1 month and 1 day' );
	} );
	test( 'already expired returns empty string', () => {
		expect( formatTimeRemaining( '2027-01-01T00:00:00Z', NOW ) ).toBe( '' );
	} );
	test( 'same day returns empty string', () => {
		expect( formatTimeRemaining( '2027-03-05T00:00:00Z', NOW ) ).toBe( '' );
	} );
} );

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
	test( 'one-time', () => {
		expect(
			getProductCategory( makePurchase( { is_plan: false, expiry_status: 'one-time-purchase' } ) )
		).toBe( 'one-time' );
	} );
} );

describe( 'getCancellationHeading', () => {
	test( 'Auto-renew intent returns "Turn off auto-renew"', () => {
		for ( const category of [ 'plan', 'domain', 'email', 'jetpack', 'other' ] ) {
			const purchase = makePurchaseForCategory( category );
			expect( getCancellationHeading( { purchase, intent: 'auto-renew' } ) ).toBe(
				'Turn off auto-renew'
			);
		}
	} );
	test( 'Cancel intent is always "Cancel subscription" regardless of product', () => {
		for ( const category of [ 'plan', 'domain', 'email', 'jetpack', 'other' ] ) {
			const purchase = makePurchaseForCategory( category );
			expect( getCancellationHeading( { purchase, intent: 'cancel' } ) ).toBe(
				'Cancel subscription'
			);
		}
	} );
	test( 'Remove uses category heading for plan / domain / email', () => {
		expect(
			getCancellationHeading( {
				purchase: makePurchaseForCategory( 'plan' ),
				intent: 'remove',
			} )
		).toBe( 'Remove plan' );
		expect(
			getCancellationHeading( {
				purchase: makePurchaseForCategory( 'domain' ),
				intent: 'remove',
			} )
		).toBe( 'Remove domain' );
		expect(
			getCancellationHeading( {
				purchase: makePurchaseForCategory( 'email' ),
				intent: 'remove',
			} )
		).toBe( 'Remove email' );
	} );
	test( 'Remove uses product name for Jetpack / Akismet / marketplace / one-time', () => {
		expect(
			getCancellationHeading( {
				purchase: makePurchaseForCategory( 'jetpack', { product_name: 'Jetpack Search' } ),
				intent: 'remove',
			} )
		).toBe( 'Remove Jetpack Search' );
		expect(
			getCancellationHeading( {
				purchase: makePurchaseForCategory( 'one-time', {
					product_name: 'Do it for me: Website Design',
				} ),
				intent: 'remove',
			} )
		).toBe( 'Remove Do it for me: Website Design' );
	} );
	test( 'Remove generic fallback is "Remove upgrade"', () => {
		expect(
			getCancellationHeading( {
				purchase: makePurchaseForCategory( 'other' ),
				intent: 'remove',
			} )
		).toBe( 'Remove upgrade' );
	} );
} );

describe( 'getTopNoticeCopy', () => {
	// The live duration depends on "now", so we just assert the notice shape
	// rather than the exact number of months/days.
	test( 'returns null for Remove intent', () => {
		expect( getTopNoticeCopy( { purchase: makePurchase(), intent: 'remove' } ) ).toBeNull();
	} );
	test( 'auto-renew intent returns non-null for a plan with a future expiry', () => {
		const copy = getTopNoticeCopy( {
			purchase: makePurchaseForCategory( 'plan', {
				expiry_date: new Date( Date.now() + 30 * 24 * 60 * 60 * 1000 ).toISOString(),
			} ),
			intent: 'auto-renew',
		} );
		expect( copy ).toMatch( /^Your plan features will be available for another /i );
	} );
	test( 'returns null with no expiry date', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchase( { expiry_date: '' } ),
				intent: 'cancel',
			} )
		).toBeNull();
	} );
	test( 'returns null when expiry is in the past', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchase( { expiry_date: '2000-01-01T00:00:00Z' } ),
				intent: 'cancel',
			} )
		).toBeNull();
	} );
	test( 'plan copy is the tightened "available for another {duration}." form', () => {
		const copy = getTopNoticeCopy( {
			purchase: makePurchaseForCategory( 'plan', {
				expiry_date: new Date( Date.now() + 30 * 24 * 60 * 60 * 1000 ).toISOString(),
			} ),
			intent: 'cancel',
		} );
		expect( copy ).toMatch( /^Your plan features will be available for another /i );
		expect( copy ).not.toMatch( /after you cancel/i );
	} );
	test( 'one-time returns null', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchaseForCategory( 'one-time', {
					expiry_date: new Date( Date.now() + 30 * 24 * 60 * 60 * 1000 ).toISOString(),
				} ),
				intent: 'cancel',
			} )
		).toBeNull();
	} );
	test( 'jetpack uses the product name', () => {
		const copy = getTopNoticeCopy( {
			purchase: makePurchaseForCategory( 'jetpack', {
				product_name: 'Jetpack Security',
				expiry_date: new Date( Date.now() + 30 * 24 * 60 * 60 * 1000 ).toISOString(),
			} ),
			intent: 'cancel',
		} );
		expect( copy ).toMatch( /^Jetpack Security will remain active for another /i );
	} );
} );

describe( 'getCheckboxLabel', () => {
	test( 'universal copy — same for Cancel and Remove, any product', () => {
		expect( getCheckboxLabel() ).toBe( 'I’ve reviewed what I’ll lose and want to proceed.' );
	} );
} );

describe( 'getButtonLabels', () => {
	test( 'Auto-renew intent returns "Turn off auto-renew" / "Keep auto-renew on"', () => {
		for ( const category of [ 'plan', 'domain', 'email', 'jetpack', 'other' ] ) {
			const purchase = makePurchaseForCategory( category );
			expect( getButtonLabels( { purchase, intent: 'auto-renew' } ) ).toEqual( {
				primary: 'Turn off auto-renew',
				secondary: 'Keep auto-renew on',
			} );
		}
	} );
	test( 'Cancel intent always uses "Cancel subscription" / "Keep subscription"', () => {
		for ( const category of [ 'plan', 'domain', 'email', 'jetpack', 'one-time', 'other' ] ) {
			const purchase = makePurchaseForCategory( category );
			expect( getButtonLabels( { purchase, intent: 'cancel' } ) ).toEqual( {
				primary: 'Cancel subscription',
				secondary: 'Keep subscription',
			} );
		}
	} );
	test( 'Remove primary is "Continue removal"; secondary stays per-category', () => {
		expect(
			getButtonLabels( { purchase: makePurchaseForCategory( 'plan' ), intent: 'remove' } )
		).toEqual( { primary: 'Continue removal', secondary: 'Keep plan' } );
		expect(
			getButtonLabels( { purchase: makePurchaseForCategory( 'domain' ), intent: 'remove' } )
		).toEqual( { primary: 'Continue removal', secondary: 'Keep domain' } );
		expect(
			getButtonLabels( { purchase: makePurchaseForCategory( 'email' ), intent: 'remove' } )
		).toEqual( { primary: 'Continue removal', secondary: 'Keep email' } );
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
