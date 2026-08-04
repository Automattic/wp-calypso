/**
 * Pins the other side of the kill switch: with COMMERCIAL_PAYWALL_KILLED flipped back to `false`,
 * the classifier paywall must enforce exactly as it did before STATS-387. Without this, nothing
 * proves the switch is reversible rather than simply dead.
 *
 * Because the switch is applied on read and never rewrites the stored payload, a store written
 * while the switch was on is indistinguishable from one written before it shipped — so these
 * fixtures cover both.
 */
import { isEnabled } from '@automattic/calypso-config';
import { STAT_TYPE_CLICKS, STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS } from '../../constants';
import ALL_STATS_NOTICES from '../../stats-notices/all-notice-definitions';
import { shouldGateStats } from '../use-should-gate-stats';
import { shouldShowPaywallAfterGracePeriod, shouldShowPaywallNotice } from '../use-stats-purchases';

jest.mock( 'calypso/state/stats/plan-usage/constants', () => ( {
	COMMERCIAL_PAYWALL_KILLED: false,
} ) );

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = jest.fn();
	return config;
} );

const siteId = 123;

const walledCommercialSiteState = {
	sites: {
		features: { [ siteId ]: { data: { active: [] } } },
		items: {
			[ siteId ]: {
				jetpack: true,
				options: { is_wpcom_atomic: false, is_commercial: true },
			},
		},
	},
	purchases: { data: [] },
	stats: {
		planUsage: {
			data: {
				[ siteId ]: { should_show_paywall: true, paywall_date_from: '2026-07-14' },
			},
		},
	},
};

describe( 'with COMMERCIAL_PAYWALL_KILLED flipped back to false', () => {
	beforeAll( () => {
		( isEnabled as jest.Mock ).mockImplementation( () => false );
	} );

	it( 'reports the paywall again for a walled commercial site', () => {
		expect( shouldShowPaywallAfterGracePeriod( walledCommercialSiteState, siteId ) ).toBe( true );
	} );

	it( 'escalates the upgrade notice to its lockout variant again', () => {
		expect( shouldShowPaywallNotice( walledCommercialSiteState, siteId ) ).toBe( true );
	} );

	it( 'gates basic stats again', () => {
		expect( shouldGateStats( walledCommercialSiteState, siteId, STAT_TYPE_CLICKS ) ).toBe( true );
	} );

	it( 'gates date controls again, restoring the 7-day limit', () => {
		expect(
			shouldGateStats( walledCommercialSiteState, siteId, STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS )
		).toBe( true );
	} );

	it( 'still exempts a site that owns commercial use', () => {
		const paidState = {
			...walledCommercialSiteState,
			purchases: {
				data: [
					{
						blog_id: siteId,
						product_slug: 'jetpack_stats_yearly',
						expiry_status: 'active',
						subscription_status: 'active',
					},
				],
			},
		};

		expect( shouldShowPaywallAfterGracePeriod( paidState, siteId ) ).toBe( false );
		expect( shouldGateStats( paidState, siteId, STAT_TYPE_CLICKS ) ).toBe( false );
	} );
} );

describe( 'commercial upgrade notice with COMMERCIAL_PAYWALL_KILLED flipped back to false', () => {
	const commercialNotice = ALL_STATS_NOTICES.find(
		( notice ) => notice.noticeId === 'commercial_site_upgrade'
	);

	it( 're-enables the registry entry so the paywall lockout banner can render', () => {
		expect( commercialNotice?.disabled ).toBe( false );
		expect(
			commercialNotice?.isVisibleFunc( {
				siteId,
				isOdysseyStats: false,
				isSiteJetpackNotAtomic: true,
				isCommercial: true,
				isVip: false,
				hasPaidStats: false,
				showPaywallNotice: true,
			} )
		).toBe( true );
	} );
} );
