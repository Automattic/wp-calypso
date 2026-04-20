import {
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
		meta: '',
		...overrides,
	} as Purchases.Purchase;
}

const DATE = 'April 16, 2027';

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
	test( 'marketplace', () => {
		expect(
			getProductCategory(
				makePurchase( {
					productSlug: 'wp_premium',
					productType: 'marketplace_plugin',
				} as Partial< Purchases.Purchase > )
			)
		).toBe( 'marketplace' );
	} );
	test( 'one-time', () => {
		expect( getProductCategory( makePurchase( { expiryStatus: 'oneTimePurchase' } ) ) ).toBe(
			'one-time'
		);
	} );
} );

describe( 'getCancellationHeading (legacy)', () => {
	test( 'cancel plan', () => {
		expect(
			getCancellationHeading( {
				purchase: makePurchase(),
				intent: 'cancel',
				expiryDateFormatted: DATE,
			} )
		).toBe( 'Cancel plan' );
	} );
	test( 'remove plan', () => {
		expect(
			getCancellationHeading( {
				purchase: makePurchase(),
				intent: 'remove',
				expiryDateFormatted: DATE,
			} )
		).toBe( 'Remove plan' );
	} );
	test( 'cancel domain', () => {
		expect(
			getCancellationHeading( {
				purchase: makePurchase( {
					productSlug: 'dotcom_domain',
					isDomainRegistration: true,
				} as Partial< Purchases.Purchase > ),
				intent: 'cancel',
				expiryDateFormatted: DATE,
			} )
		).toBe( 'Cancel domain' );
	} );
} );

describe( 'getTopNoticeCopy (legacy)', () => {
	test( 'remove returns null', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchase(),
				intent: 'remove',
				expiryDateFormatted: DATE,
			} )
		).toBeNull();
	} );
	test( 'cancel plan includes date', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchase(),
				intent: 'cancel',
				expiryDateFormatted: DATE,
			} )
		).toBe( `Your plan is active until ${ DATE }.` );
	} );
	test( 'cancel email', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchase( { productSlug: 'wp_titan_mail_monthly' } ),
				intent: 'cancel',
				expiryDateFormatted: DATE,
			} )
		).toBe( `Your email is active until ${ DATE }.` );
	} );
	test( 'one-time returns null', () => {
		expect(
			getTopNoticeCopy( {
				purchase: makePurchase( { expiryStatus: 'oneTimePurchase' } ),
				intent: 'cancel',
				expiryDateFormatted: DATE,
			} )
		).toBeNull();
	} );
} );

describe( 'getCheckboxLabel (legacy)', () => {
	test( 'cancel plan includes date', () => {
		expect(
			getCheckboxLabel( {
				purchase: makePurchase(),
				intent: 'cancel',
				expiryDateFormatted: DATE,
			} )
		).toBe( `I understand my plan will expire on ${ DATE }.` );
	} );
	test( 'remove plan omits date', () => {
		expect(
			getCheckboxLabel( {
				purchase: makePurchase(),
				intent: 'remove',
				expiryDateFormatted: DATE,
			} )
		).toBe( 'I understand my plan will be removed immediately.' );
	} );
	test( 'cancel with no expiry falls back to generic copy', () => {
		expect(
			getCheckboxLabel( {
				purchase: makePurchase( { expiryStatus: 'oneTimePurchase' } ),
				intent: 'cancel',
				expiryDateFormatted: '',
			} )
		).toBe( 'I understand my subscription will be cancelled.' );
	} );
} );

describe( 'getButtonLabels (legacy)', () => {
	test( 'cancel plan', () => {
		expect( getButtonLabels( { purchase: makePurchase(), intent: 'cancel' } ) ).toEqual( {
			primary: 'Cancel plan',
			secondary: 'Keep plan',
		} );
	} );
	test( 'remove email', () => {
		expect(
			getButtonLabels( {
				purchase: makePurchase( { productSlug: 'wp_titan_mail_monthly' } ),
				intent: 'remove',
			} )
		).toEqual( { primary: 'Remove email', secondary: 'Keep email' } );
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
