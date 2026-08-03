import { selectPlanUsage } from '../use-plan-usage-query';
import { shouldShowPaywallAfterGracePeriod, shouldShowPaywallNotice } from '../use-stats-purchases';
import type { PlanUsage } from '../use-plan-usage-query';

const siteId = 123;

// What the API returns for a site carrying the `jetpack-site-has-commercial-paywall` sticker:
// the sticker date, and an elapsed grace period.
const walledApiPayload = {
	should_show_paywall: true,
	paywall_date_from: '2026-07-14',
	upgrade_deadline_date: '2026-07-21',
	views_limit: 10000,
	current_usage: { views_count: 12000 },
	recent_usages: [ { views_count: 12000 }, { views_count: 11000 } ],
} as unknown as PlanUsage;

const reduxStateFor = ( usage: PlanUsage ) => ( {
	purchases: { data: [] },
	stats: { planUsage: { data: { [ siteId ]: usage } } },
} );

describe( 'selectPlanUsage with the commercial paywall kill switch on', () => {
	it( 'neutralises both sticker-derived fields', () => {
		const usage = selectPlanUsage( walledApiPayload );

		expect( usage.should_show_paywall ).toBe( false );
		expect( usage.paywall_date_from ).toBeNull();
	} );

	it( 'leaves the rest of the usage payload alone', () => {
		const usage = selectPlanUsage( walledApiPayload );

		expect( usage.views_limit ).toBe( 10000 );
		expect( usage.current_usage.views_count ).toBe( 12000 );
		expect( usage.upgrade_deadline_date ).toBe( '2026-07-21' );
		expect( usage.validMonthlyViews ).toBe( 11000 );
	} );
} );

// Both selectors read what the query put in the store, so neutralising upstream is enough —
// neither needs to know the switch exists.
describe( 'paywall selectors reading the neutralised usage data', () => {
	const state = reduxStateFor( selectPlanUsage( walledApiPayload ) );

	it( 'does not report the paywall for a walled site', () => {
		expect( shouldShowPaywallAfterGracePeriod( state, siteId ) ).toBe( false );
	} );

	it( 'does not escalate the upgrade notice for a walled site', () => {
		expect( shouldShowPaywallNotice( state, siteId ) ).toBe( false );
	} );
} );
