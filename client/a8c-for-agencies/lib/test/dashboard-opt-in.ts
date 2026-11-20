import { getClassicPath, getDashboardPath } from '../dashboard-opt-in';

describe( 'getDashboardPath', () => {
	it.each( [
		[ '/overview', '/overview' ],
		[ '/agency-tier', '/tiers' ],
		[ '/team', '/agency/team' ],
		[ '/team/invite', '/agency/team' ],
		[ '/sites', '/sites' ],
		[ '/sites/all/example.com', '/sites/example.com' ],
		[ '/sites/all/example.com/jetpack-backup', '/sites/example.com/backups' ],
		[ '/sites/all/example.com/jetpack-activity', '/sites/example.com/logs/activity' ],
		[ '/sites/all/example.com/jetpack-boost', '/sites/example.com' ],
		[ '/marketplace', '/marketplace' ],
		[ '/marketplace/products', '/products' ],
		[ '/marketplace/hosting/pressable', '/hosting/pressable' ],
		[ '/purchases/licenses/unassigned', '/purchases' ],
		[ '/referrals/dashboard', '/referrals' ],
		[ '/referrals/payment-settings', '/payout-settings' ],
		[ '/migrations/commissions', '/migrations' ],
		[ '/woopayments/dashboard', '/woopayments' ],
		[ '/partner-directory/agency-expertise', '/partner-directory/expertise' ],
		[ '/resources-and-tools/learn', '/library' ],
		[ '/resources-and-tools/ai-mcp/read', '/agency/ai/read' ],
		[ '/overview/', '/overview' ],
	] )( 'sends %s to %s', ( pathname, expected ) => {
		expect( getDashboardPath( pathname ) ).toBe( expected );
	} );

	it( 'carries the site ID into the WooPayments setup path', () => {
		expect( getDashboardPath( '/woopayments/site-setup', { site_id: '123' } ) ).toBe(
			'/woopayments/setup/123'
		);
	} );

	it( 'sends a referral checkout link to the referral checkout', () => {
		expect( getDashboardPath( '/marketplace/checkout', { referral_blog_id: '42' } ) ).toBe(
			'/referral-checkout?referral_blog_id=42'
		);
	} );

	it.each( [ '/prospect-reports', '/amplify', '/amplify/reports' ] )(
		'sends %s to Prospect reports',
		( pathname ) => {
			expect( getDashboardPath( pathname ) ).toBe( '/prospect-reports' );
		}
	);

	it.each( [
		'/reports',
		'/reports/dashboard',
		'/marketplace/checkout',
		'/marketplace/assign-license',
		'/purchases/invoices',
		'/settings/agency-profile',
		'/resources-and-tools/agent-studio',
		'/feedback',
	] )( 'keeps %s here', ( pathname ) => {
		expect( getDashboardPath( pathname ) ).toBeNull();
	} );
} );

describe( 'getClassicPath', () => {
	it.each( [
		[ '/products?category=jetpack', '/marketplace/products?category=jetpack' ],
		[ '/tiers', '/agency-tier' ],
		[ '/library', '/resources-and-tools/learn' ],
		[ '/hosting/pressable#plans', '/marketplace/hosting/pressable#plans' ],
		[ '/overview', '/overview' ],
		[ '/unknown', '/unknown' ],
		[ 'https://example.com/products', 'https://example.com/products' ],
		[ '//example.com/products', '//example.com/products' ],
	] )( 'sends %s to %s', ( url, expected ) => {
		expect( getClassicPath( url ) ).toBe( expected );
	} );
} );
