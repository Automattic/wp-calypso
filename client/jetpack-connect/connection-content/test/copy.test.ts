import { getAuthCopy, getLoginCopy, getSignupCopy, getSecondaryAuthCopy } from '../copy';
import type { SubtitleScenario } from '../scenarios';

/**
 * Representative slug set per scenario, used to drive every surface's
 * subtitle assertions through `getAuthCopy` / `getLoginCopy` /
 * `getSignupCopy`. The slug *combinations* are exercised separately in
 * `scenarios.test.ts`; here we treat the scenario detection as a black box
 * and verify that the right pre-composed string lands on the right
 * surface.
 */
const SCENARIO_SLUGS: Record< SubtitleScenario, readonly string[] > = {
	A4A_ONLY: [ 'automattic-for-agencies-client' ],
	A4A_WOO: [ 'automattic-for-agencies-client', 'woocommerce' ],
	A4A_JETPACK: [ 'automattic-for-agencies-client', 'jetpack-boost' ],
	ALL_THREE: [ 'automattic-for-agencies-client', 'woocommerce', 'jetpack' ],
	WOO_ONLY: [ 'woocommerce' ],
	WOO_AND_PAY: [ 'woocommerce', 'woocommerce-payments' ],
	WOO_JETPACK: [ 'woocommerce', 'jetpack' ],
	JETPACK_FULL: [ 'jetpack' ],
	JETPACK_BACKUP: [ 'jetpack-backup' ],
	JETPACK_PROTECT: [ 'jetpack-protect' ],
	JETPACK_BOOST: [ 'jetpack-boost' ],
	JETPACK_SEARCH: [ 'jetpack-search' ],
	JETPACK_SOCIAL: [ 'jetpack-social' ],
	JETPACK_VIDEOPRESS: [ 'jetpack-videopress' ],
	JETPACK_MULTI: [ 'jetpack-backup', 'jetpack-protect' ],
	OTHER_ONLY: [],
};

describe( 'titles', () => {
	test( 'auth surface returns "Connect your account" for every plugin set', () => {
		for ( const slugs of Object.values( SCENARIO_SLUGS ) ) {
			expect( getAuthCopy( slugs ).title ).toBe( 'Connect your account' );
		}
	} );

	test( 'signup surface returns "Create your account" for every plugin set', () => {
		for ( const slugs of Object.values( SCENARIO_SLUGS ) ) {
			expect( getSignupCopy( slugs ).title ).toBe( 'Create your account' );
		}
	} );

	test( 'login surface returns "Log in to WordPress.com" for every plugin set', () => {
		for ( const slugs of Object.values( SCENARIO_SLUGS ) ) {
			expect( getLoginCopy( slugs ).title ).toBe( 'Log in to WordPress.com' );
		}
	} );
} );

describe( 'login subtitles', () => {
	test.each( [
		[
			'A4A_ONLY',
			'Your site is registered with WordPress.com — finish connecting your account to manage it from your Automattic for Agencies dashboard.',
		],
		[
			'A4A_WOO',
			'Your store is registered with WordPress.com — finish connecting your account to manage it from Automattic for Agencies, use the Woo mobile app, and access store analytics.',
		],
		[
			'A4A_JETPACK',
			'Your site is registered with WordPress.com — finish connecting your account to manage it from Automattic for Agencies and power Jetpack features.',
		],
		[
			'ALL_THREE',
			'Your store is registered with WordPress.com — finish connecting your account to use the Automattic for Agencies dashboard, the Woo mobile app, and Jetpack.',
		],
		[
			'WOO_ONLY',
			'Your store is registered with WordPress.com — finish connecting your account to use the Woo mobile app and access your store analytics.',
		],
		[
			'WOO_AND_PAY',
			'Your store is registered with WordPress.com — finish connecting your account to use the Woo mobile app, access your store analytics, and enable WooPayments for payment processing.',
		],
		[
			'WOO_JETPACK',
			'Your store is registered with WordPress.com — finish connecting your account to use the Woo mobile app, access your store analytics, and power Jetpack features.',
		],
		[
			'JETPACK_FULL',
			'Your site is registered with WordPress.com — finish connecting your account to power Jetpack with backups, security, and growth tools.',
		],
		[
			'JETPACK_BACKUP',
			'Your site is registered with WordPress.com — finish connecting your account to enable real-time backups and one-click restore via Jetpack VaultPress Backup.',
		],
		[
			'JETPACK_PROTECT',
			"Your site is registered with WordPress.com — finish connecting your account to enable Jetpack Protect's security scanning and malware protection.",
		],
		[
			'JETPACK_BOOST',
			"Your site is registered with WordPress.com — finish connecting your account to enable Jetpack Boost's site performance optimization.",
		],
		[
			'JETPACK_SEARCH',
			"Your site is registered with WordPress.com — finish connecting your account to enable Jetpack Search's instant results.",
		],
		[
			'JETPACK_SOCIAL',
			"Your site is registered with WordPress.com — finish connecting your account to enable Jetpack Social's automated post sharing.",
		],
		[
			'JETPACK_VIDEOPRESS',
			"Your site is registered with WordPress.com — finish connecting your account to enable Jetpack VideoPress's ad-free video hosting.",
		],
		[
			'OTHER_ONLY',
			'Your site is registered with WordPress.com — finish connecting your account to power your active plugins.',
		],
	] satisfies Array< [ SubtitleScenario, string ] > )(
		'%s renders the expected pre-composed sentence',
		( scenario, expected ) => {
			expect( getLoginCopy( SCENARIO_SLUGS[ scenario ] ).subtitle ).toBe( expected );
		}
	);

	test( 'JETPACK_MULTI reuses the JETPACK_FULL subtitle by design', () => {
		expect( getLoginCopy( SCENARIO_SLUGS.JETPACK_MULTI ).subtitle ).toBe(
			getLoginCopy( SCENARIO_SLUGS.JETPACK_FULL ).subtitle
		);
	} );
} );

describe( 'auth subtitles', () => {
	test.each( [
		[
			'A4A_ONLY',
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Automattic for Agencies.',
		],
		[
			'A4A_WOO',
			'Your store is registered with WordPress.com — connecting your account gives it secure access to features from Automattic for Agencies and WooCommerce.',
		],
		[
			'A4A_JETPACK',
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Automattic for Agencies and Jetpack.',
		],
		[
			'ALL_THREE',
			'Your store is registered with WordPress.com — connecting your account gives it secure access to features from Automattic for Agencies, WooCommerce, and Jetpack.',
		],
		[
			'WOO_ONLY',
			'Your store is registered with WordPress.com — connecting your account gives it secure access to features from WooCommerce.',
		],
		[
			'WOO_AND_PAY',
			'Your store is registered with WordPress.com — connecting your account gives it secure access to features from WooCommerce and WooPayments.',
		],
		[
			'WOO_JETPACK',
			'Your store is registered with WordPress.com — connecting your account gives it secure access to features from WooCommerce and Jetpack.',
		],
		[
			'JETPACK_FULL',
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack.',
		],
		[
			'JETPACK_BACKUP',
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack VaultPress Backup.',
		],
		[
			'JETPACK_PROTECT',
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack Protect.',
		],
		[
			'JETPACK_BOOST',
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack Boost.',
		],
		[
			'JETPACK_SEARCH',
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack Search.',
		],
		[
			'JETPACK_SOCIAL',
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack Social.',
		],
		[
			'JETPACK_VIDEOPRESS',
			'Your site is registered with WordPress.com — connecting your account gives it secure access to features from Jetpack VideoPress.',
		],
		[
			'OTHER_ONLY',
			'Your site is registered with WordPress.com — connecting your account gives it secure access to the features your active plugins need.',
		],
	] satisfies Array< [ SubtitleScenario, string ] > )(
		'%s renders the expected pre-composed sentence',
		( scenario, expected ) => {
			expect( getAuthCopy( SCENARIO_SLUGS[ scenario ] ).subtitle ).toBe( expected );
		}
	);

	test( 'JETPACK_MULTI reuses the JETPACK_FULL subtitle by design', () => {
		expect( getAuthCopy( SCENARIO_SLUGS.JETPACK_MULTI ).subtitle ).toBe(
			getAuthCopy( SCENARIO_SLUGS.JETPACK_FULL ).subtitle
		);
	} );
} );

describe( 'signup subtitles', () => {
	test.each( [
		[
			'A4A_ONLY',
			"You'll use it to manage your site from your Automattic for Agencies dashboard.",
		],
		[
			'A4A_WOO',
			"You'll use it to manage your store from Automattic for Agencies, log in to the Woo mobile app, and view store analytics.",
		],
		[
			'A4A_JETPACK',
			"You'll use it to manage your site from Automattic for Agencies and power Jetpack features.",
		],
		[
			'ALL_THREE',
			"You'll use it to access the Automattic for Agencies dashboard, the Woo mobile app, and Jetpack.",
		],
		[ 'WOO_ONLY', "You'll use it to log in to the Woo mobile app and view your store analytics." ],
		[
			'WOO_AND_PAY',
			"You'll use it to log in to the Woo mobile app, view your store analytics, and enable WooPayments for payment processing.",
		],
		[
			'WOO_JETPACK',
			"You'll use it to log in to the Woo mobile app, view your store analytics, and power Jetpack features.",
		],
		[
			'JETPACK_FULL',
			"You'll use it to power Jetpack with backups, security, and growth tools on your site.",
		],
		[
			'JETPACK_BACKUP',
			"You'll use it to enable real-time backups and one-click restore for your site via Jetpack VaultPress Backup.",
		],
		[
			'JETPACK_PROTECT',
			"You'll use it to enable Jetpack Protect's security scanning and malware protection on your site.",
		],
		[ 'JETPACK_BOOST', "You'll use it to enable Jetpack Boost's site performance optimization." ],
		[ 'JETPACK_SEARCH', "You'll use it to enable Jetpack Search's instant results on your site." ],
		[ 'JETPACK_SOCIAL', "You'll use it to enable Jetpack Social's automated post sharing." ],
		[
			'JETPACK_VIDEOPRESS',
			"You'll use it to enable Jetpack VideoPress's ad-free video hosting on your site.",
		],
		[ 'OTHER_ONLY', "You'll use it to power your active plugins." ],
	] satisfies Array< [ SubtitleScenario, string ] > )(
		'%s renders the expected pre-composed sentence',
		( scenario, expected ) => {
			expect( getSignupCopy( SCENARIO_SLUGS[ scenario ] ).subtitle ).toBe( expected );
		}
	);

	test( 'JETPACK_MULTI reuses the JETPACK_FULL subtitle by design', () => {
		expect( getSignupCopy( SCENARIO_SLUGS.JETPACK_MULTI ).subtitle ).toBe(
			getSignupCopy( SCENARIO_SLUGS.JETPACK_FULL ).subtitle
		);
	} );
} );

describe( 'default arguments', () => {
	test( 'every resolver tolerates an empty/missing plugin list and lands on OTHER_ONLY', () => {
		const expectedAuth = getAuthCopy( [] );
		const expectedLogin = getLoginCopy( [] );
		const expectedSignup = getSignupCopy( [] );

		expect( getAuthCopy() ).toEqual( expectedAuth );
		expect( getLoginCopy() ).toEqual( expectedLogin );
		expect( getSignupCopy() ).toEqual( expectedSignup );

		expect( expectedAuth.subtitle ).toContain( 'features your active plugins need' );
		expect( expectedLogin.subtitle ).toContain( 'power your active plugins' );
		expect( expectedSignup.subtitle ).toContain( 'power your active plugins' );
	} );
} );

describe( 'secondary auth copy', () => {
	test( 'title is "Connect your account" for both admin and non-admin', () => {
		expect( getSecondaryAuthCopy( true, [ 'jetpack' ] ).title ).toBe( 'Connect your account' );
		expect( getSecondaryAuthCopy( false, [ 'jetpack' ] ).title ).toBe( 'Connect your account' );
	} );

	test( 'non-admin subtitle uses simple manage-site framing regardless of plugins', () => {
		const jp = getSecondaryAuthCopy( false, [ 'jetpack' ] ).subtitle;
		const woo = getSecondaryAuthCopy( false, [ 'woocommerce' ] ).subtitle;
		const empty = getSecondaryAuthCopy( false, [] ).subtitle;
		expect( jp ).toContain( 'manage this site' );
		expect( woo ).toBe( jp );
		expect( empty ).toBe( jp );
	} );

	test( 'admin subtitle with Jetpack mentions activity logs and Jetpack Cloud', () => {
		const { subtitle } = getSecondaryAuthCopy( true, [ 'jetpack' ] );
		expect( subtitle ).toContain( 'activity logs' );
		expect( subtitle ).toContain( 'Jetpack Cloud' );
	} );

	test( 'admin subtitle with Woo (no Jetpack) mentions store analytics and Woo mobile app', () => {
		const { subtitle } = getSecondaryAuthCopy( true, [ 'woocommerce' ] );
		expect( subtitle ).toContain( 'store analytics' );
		expect( subtitle ).toContain( 'Woo mobile app' );
		expect( subtitle ).not.toContain( 'Jetpack Cloud' );
	} );

	test( 'admin subtitle with Jetpack + Woo mentions both Jetpack Cloud and Woo', () => {
		const { subtitle } = getSecondaryAuthCopy( true, [ 'jetpack', 'woocommerce' ] );
		expect( subtitle ).toContain( 'Jetpack Cloud' );
		expect( subtitle ).toContain( 'Woo mobile app' );
	} );

	test( 'admin subtitle with unknown plugins uses generic manage-site framing', () => {
		const { subtitle } = getSecondaryAuthCopy( true, [ 'unknown-plugin' ] );
		expect( subtitle ).toContain( 'manage this site' );
	} );

	test( 'admin subtitle with empty plugins uses generic manage-site framing', () => {
		const { subtitle } = getSecondaryAuthCopy( true, [] );
		expect( subtitle ).toContain( 'manage this site' );
	} );

	test( 'admin and non-admin subtitles are different', () => {
		expect( getSecondaryAuthCopy( true, [ 'jetpack' ] ).subtitle ).not.toBe(
			getSecondaryAuthCopy( false, [ 'jetpack' ] ).subtitle
		);
	} );
} );
