import { canHoldLicenses } from '../cart-licenses';

const backup = { slug: 'jetpack-backup-t1', family_slug: 'jetpack-backup' };
const memoryAddon = { slug: 'pressable-addon-php-memory-512', family_slug: 'pressable-addons' };
const pressablePlan = { slug: 'pressable-build', family_slug: 'pressable-hosting' };
const wpcomPlan = { slug: 'wpcom-hosting-business', family_slug: 'wpcom-hosting' };

const agencyPurchase = { isReferralMode: false, isLegacyBilling: false };
const referral = { isReferralMode: true, isLegacyBilling: false };

describe( 'canHoldLicenses', () => {
	it( 'holds a count for agencies on Billing Dragon, in a purchase or a referral', () => {
		expect( canHoldLicenses( backup, agencyPurchase ) ).toBe( true );
		expect( canHoldLicenses( backup, referral ) ).toBe( true );
	} );

	it( 'holds one of each on the previous billing system', () => {
		expect( canHoldLicenses( backup, { ...agencyPurchase, isLegacyBilling: true } ) ).toBe( false );
		expect( canHoldLicenses( backup, { ...referral, isLegacyBilling: true } ) ).toBe( false );
	} );

	it( 'holds a count of a Pressable add-on, but one Pressable plan', () => {
		expect( canHoldLicenses( memoryAddon, agencyPurchase ) ).toBe( true );
		expect( canHoldLicenses( pressablePlan, agencyPurchase ) ).toBe( false );
	} );

	it( 'holds one WordPress.com site in a referral', () => {
		expect( canHoldLicenses( wpcomPlan, agencyPurchase ) ).toBe( true );
		expect( canHoldLicenses( wpcomPlan, referral ) ).toBe( false );
	} );
} );
