import { shouldShowPaywallAfterGracePeriod, shouldShowPaywallNotice } from '../use-stats-purchases';

const siteId = 123;

// What the API returns — and what therefore lands in the store, since the switch is applied on
// read rather than on the way in — for a site carrying the `jetpack-site-has-commercial-paywall`
// sticker: the sticker date, and an elapsed grace period.
const walledUsage = {
	should_show_paywall: true,
	paywall_date_from: '2026-07-14',
	upgrade_deadline_date: '2026-07-21',
};

const commercialPurchase = {
	blog_id: siteId,
	product_slug: 'jetpack_stats_yearly',
	expiry_status: 'active',
	subscription_status: 'active',
};

const stateWith = ( usage: object | undefined, purchases: object[] = [] ) => ( {
	purchases: { data: purchases },
	stats: { planUsage: { data: usage ? { [ siteId ]: usage } : {} } },
} );

describe( 'paywall selectors with the commercial paywall kill switch on', () => {
	it( 'does not report the paywall for a walled site', () => {
		expect( shouldShowPaywallAfterGracePeriod( stateWith( walledUsage ), siteId ) ).toBe( false );
	} );

	it( 'does not escalate the upgrade notice for a walled site', () => {
		expect( shouldShowPaywallNotice( stateWith( walledUsage ), siteId ) ).toBe( false );
	} );

	it.each( [
		[ 'a site that owns commercial use', walledUsage, [ commercialPurchase ] ],
		[ 'a site with no usage data yet', undefined, [] ],
	] )( 'stays false for %s', ( _, usage, purchases ) => {
		const state = stateWith( usage, purchases );

		expect( shouldShowPaywallAfterGracePeriod( state, siteId ) ).toBe( false );
		expect( shouldShowPaywallNotice( state, siteId ) ).toBe( false );
	} );

	it( 'stays false without a site', () => {
		expect( shouldShowPaywallAfterGracePeriod( stateWith( walledUsage ), null ) ).toBe( false );
		expect( shouldShowPaywallNotice( stateWith( walledUsage ), null ) ).toBe( false );
	} );
} );
