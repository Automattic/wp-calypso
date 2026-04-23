import moment from 'moment';
import {
	formatTimeRemaining,
	getProductCategory,
	getCancellationHeading,
	getTopNoticeCopy,
	getCheckboxLabel,
	getButtonLabels,
	getFallbackLossItems,
} from '../get-confirmation-copy';
import type { Purchases } from '@automattic/data-stores';

function makePurchase( overrides: Partial< Purchases.Purchase > = {} ): Purchases.Purchase {
	return {
		productName: 'WordPress.com Business',
		productSlug: 'business-bundle',
		productType: '',
		expiryStatus: 'autoRenewing',
		expiryDate: '2027-04-16T00:00:00+00:00',
		meta: '',
		...overrides,
	} as Purchases.Purchase;
}

const NOW = moment( '2027-03-05' );

describe( 'formatTimeRemaining (legacy)', () => {
	test( 'months + days', () => {
		expect( formatTimeRemaining( '2027-04-16', NOW ) ).toBe( '1 month and 11 days' );
	} );
	test( 'only days', () => {
		expect( formatTimeRemaining( '2027-03-19', NOW ) ).toBe( '14 days' );
	} );
	test( 'only months', () => {
		expect( formatTimeRemaining( '2027-06-05', NOW ) ).toBe( '3 months' );
	} );
	test( 'years + months (days omitted past the one-year mark)', () => {
		expect( formatTimeRemaining( '2029-06-05', NOW ) ).toBe( '2 years and 3 months' );
	} );
	test( 'already expired returns empty string', () => {
		expect( formatTimeRemaining( '2027-01-01', NOW ) ).toBe( '' );
	} );
} );

describe( 'getProductCategory (legacy)', () => {
	test( 'plan', () => {
		expect( getProductCategory( makePurchase( { productSlug: 'business-bundle' } ) ) ).toBe(
			'plan'
		);
	} );
	test( 'domain', () => {
		expect(
			getProductCategory(
				makePurchase( {
					productSlug: 'dotcom_domain',
					isDomainRegistration: true,
				} as Partial< Purchases.Purchase > )
			)
		).toBe( 'domain' );
	} );
	test( 'email (Titan)', () => {
		expect( getProductCategory( makePurchase( { productSlug: 'wp_titan_mail_monthly' } ) ) ).toBe(
			'email'
		);
	} );
	test( 'email (Google Workspace)', () => {
		expect( getProductCategory( makePurchase( { productSlug: 'gapps' } ) ) ).toBe( 'email' );
	} );
	test( 'akismet', () => {
		expect( getProductCategory( makePurchase( { productSlug: 'ak_plus_yearly_1' } ) ) ).toBe(
			'akismet'
		);
	} );
	test( 'jetpack', () => {
		expect(
			getProductCategory( makePurchase( { productSlug: 'jetpack_backup_t1_yearly' } ) )
		).toBe( 'jetpack' );
	} );
	test( 'one-time', () => {
		expect( getProductCategory( makePurchase( { expiryStatus: 'oneTimePurchase' } ) ) ).toBe(
			'one-time'
		);
	} );
} );

describe( 'getCancellationHeading (legacy)', () => {
	test( 'Cancel intent → "Cancel subscription" regardless of product', () => {
		expect( getCancellationHeading( { purchase: makePurchase(), intent: 'cancel' } ) ).toBe(
			'Cancel subscription'
		);
	} );
	test( 'Remove intent uses category heading', () => {
		expect( getCancellationHeading( { purchase: makePurchase(), intent: 'remove' } ) ).toBe(
			'Remove plan'
		);
		expect(
			getCancellationHeading( {
				purchase: makePurchase( {
					productSlug: 'dotcom_domain',
					isDomainRegistration: true,
				} as Partial< Purchases.Purchase > ),
				intent: 'remove',
			} )
		).toBe( 'Remove domain' );
	} );
	test( 'Remove uses product name for Jetpack products', () => {
		expect(
			getCancellationHeading( {
				purchase: makePurchase( {
					productSlug: 'jetpack_backup_t1_yearly',
					productName: 'Jetpack Search',
				} ),
				intent: 'remove',
			} )
		).toBe( 'Remove Jetpack Search' );
	} );
} );

describe( 'getTopNoticeCopy (legacy)', () => {
	test( 'returns null for Remove intent', () => {
		expect( getTopNoticeCopy( { purchase: makePurchase(), intent: 'remove' } ) ).toBeNull();
	} );
	test( 'returns null with no expiry date', () => {
		expect(
			getTopNoticeCopy( { purchase: makePurchase( { expiryDate: '' } ), intent: 'cancel' } )
		).toBeNull();
	} );
	test( 'plan copy is the tightened "available for another {duration}." form', () => {
		const copy = getTopNoticeCopy( {
			purchase: makePurchase( {
				expiryDate: moment().add( 30, 'days' ).toISOString(),
			} ),
			intent: 'cancel',
		} );
		expect( copy ).toMatch( /^Your plan features will be available for another /i );
		expect( copy ).not.toMatch( /after you cancel/i );
	} );
	test( 'one-time returns null', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchase( {
					expiryStatus: 'oneTimePurchase',
					expiryDate: moment().add( 30, 'days' ).toISOString(),
				} ),
				intent: 'cancel',
			} )
		).toBeNull();
	} );
} );

describe( 'getCheckboxLabel (legacy)', () => {
	test( 'universal copy', () => {
		expect( getCheckboxLabel() ).toBe( 'I’ve reviewed what I’ll lose and want to proceed.' );
	} );
} );

describe( 'getButtonLabels (legacy)', () => {
	// Test env has `purchases/split-cancel-remove` on, so the primary label is
	// the generic "Continue cancellation" / "Continue removal" override; the
	// secondary stays per-category. When the flag goes to 100% this block can
	// collapse into assertions without the override.
	test( 'Cancel intent uses "Continue cancellation" under flag', () => {
		expect( getButtonLabels( { purchase: makePurchase(), intent: 'cancel' } ) ).toEqual( {
			primary: 'Continue cancellation',
			secondary: 'Keep subscription',
		} );
	} );
	test( 'Remove intent uses "Continue removal" with category-specific secondary', () => {
		expect(
			getButtonLabels( {
				purchase: makePurchase( { productSlug: 'wp_titan_mail_monthly' } ),
				intent: 'remove',
			} )
		).toEqual( { primary: 'Continue removal', secondary: 'Keep email' } );
	} );
} );

describe( 'getFallbackLossItems (legacy)', () => {
	test( 'plan', () => {
		expect(
			getFallbackLossItems( makePurchase( { productName: 'WordPress.com Business' } ) )
		).toEqual( [ 'All WordPress.com Business features' ] );
	} );
	test( 'domain uses meta', () => {
		expect(
			getFallbackLossItems(
				makePurchase( {
					productSlug: 'dotcom_domain',
					isDomainRegistration: true,
					meta: 'mydomain.com',
				} as Partial< Purchases.Purchase > )
			)
		).toEqual( [ 'Your domain at mydomain.com' ] );
	} );
	test( 'email (Titan)', () => {
		expect(
			getFallbackLossItems( makePurchase( { productSlug: 'wp_titan_mail_monthly' } ) )
		).toEqual( [ 'Your professional email accounts' ] );
	} );
	test( 'email (Google Workspace)', () => {
		expect( getFallbackLossItems( makePurchase( { productSlug: 'gapps' } ) ) ).toEqual( [
			'Your Google Workspace accounts',
		] );
	} );
	test( 'akismet', () => {
		expect( getFallbackLossItems( makePurchase( { productSlug: 'ak_plus_yearly_1' } ) ) ).toEqual( [
			'Akismet spam protection',
		] );
	} );
	test( 'jetpack', () => {
		expect(
			getFallbackLossItems(
				makePurchase( {
					productSlug: 'jetpack_backup_t1_yearly',
					productName: 'Jetpack Security',
				} )
			)
		).toEqual( [ 'Jetpack Security protection' ] );
	} );
	test( 'one-time returns the product name', () => {
		expect(
			getFallbackLossItems(
				makePurchase( {
					productName: 'Do it for me: Website Design',
					expiryStatus: 'oneTimePurchase',
				} )
			)
		).toEqual( [ 'Do it for me: Website Design' ] );
	} );
} );
