import { shouldShowPaywallAfterGracePeriod, shouldShowPaywallNotice } from '../use-stats-purchases';

const siteId = 123;

// A site carrying the `jetpack-site-has-commercial-paywall` sticker: the API reports both the
// sticker date and the elapsed grace period, and the site owns nothing granting commercial use.
const walledState = {
	purchases: {
		data: [],
	},
	stats: {
		planUsage: {
			data: {
				[ siteId ]: {
					should_show_paywall: true,
					paywall_date_from: '2026-07-14',
				},
			},
		},
	},
};

const commercialPurchase = {
	blog_id: siteId,
	product_slug: 'jetpack_stats_yearly',
	expiry_status: 'active',
	subscription_status: 'active',
};

describe( 'shouldShowPaywallAfterGracePeriod', () => {
	it( 'ignores the commercial paywall sticker while the kill switch is on', () => {
		expect( shouldShowPaywallAfterGracePeriod( walledState, siteId ) ).toBe( false );
	} );

	it( 'stays false for a site that owns commercial use', () => {
		expect(
			shouldShowPaywallAfterGracePeriod(
				{ ...walledState, purchases: { data: [ commercialPurchase ] } },
				siteId
			)
		).toBe( false );
	} );

	it( 'stays false without a site', () => {
		expect( shouldShowPaywallAfterGracePeriod( walledState, null ) ).toBe( false );
	} );
} );

// The upgrade notice is handled separately, so this PR must leave it escalating as it does today.
describe( 'shouldShowPaywallNotice', () => {
	it( 'still reports the sticker, so the notice behaviour is unchanged here', () => {
		expect( shouldShowPaywallNotice( walledState, siteId ) ).toBe( true );
	} );

	it( 'is false for a site that owns commercial use', () => {
		expect(
			shouldShowPaywallNotice(
				{ ...walledState, purchases: { data: [ commercialPurchase ] } },
				siteId
			)
		).toBe( false );
	} );
} );
