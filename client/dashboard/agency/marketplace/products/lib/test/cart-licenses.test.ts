import { canHoldLicenses, getMaxLicenses, MAX_PRODUCT_LICENSES } from '../cart-licenses';

const backup = { slug: 'jetpack-backup-t1', family_slug: 'jetpack-backup' };
const memoryAddon = { slug: 'pressable-addon-php-memory-512', family_slug: 'pressable-addons' };
const pressablePlan = { slug: 'pressable-build', family_slug: 'pressable-hosting' };
const wpcomPlan = { slug: 'wpcom-hosting-business', family_slug: 'wpcom-hosting' };

const agencyPurchase = { isReferralMode: false, isLegacyBilling: false };

describe( 'getMaxLicenses', () => {
	it( 'stops a product at the per-order maximum', () => {
		expect( getMaxLicenses( backup ) ).toBe( MAX_PRODUCT_LICENSES );
	} );

	it( 'keeps a PHP memory add-on and a Pressable plan to one', () => {
		expect( getMaxLicenses( memoryAddon ) ).toBe( 1 );
		expect( getMaxLicenses( pressablePlan ) ).toBe( 1 );
	} );

	it( 'lets WordPress.com hosting count more sites than a product', () => {
		expect( getMaxLicenses( wpcomPlan ) ).toBeGreaterThan( MAX_PRODUCT_LICENSES );
	} );
} );

describe( 'canHoldLicenses', () => {
	it( 'holds a count for an agency purchase on Billing Dragon', () => {
		expect( canHoldLicenses( backup, agencyPurchase ) ).toBe( true );
	} );

	it( 'holds one of each in a referral, on the previous billing system, and for one-of products', () => {
		expect( canHoldLicenses( backup, { ...agencyPurchase, isReferralMode: true } ) ).toBe( false );
		expect( canHoldLicenses( backup, { ...agencyPurchase, isLegacyBilling: true } ) ).toBe( false );
		expect( canHoldLicenses( memoryAddon, agencyPurchase ) ).toBe( false );
	} );
} );
