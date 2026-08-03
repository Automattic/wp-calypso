/**
 * Pins the other side of the kill switch: with COMMERCIAL_PAYWALL_KILLED flipped back to `false`,
 * the classifier paywall must enforce exactly as it did before STATS-387. Without this, nothing
 * proves the switch is reversible rather than simply dead.
 */
import { isEnabled } from '@automattic/calypso-config';
import { STAT_TYPE_CLICKS, STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS } from '../../constants';
import { selectPlanUsage } from '../use-plan-usage-query';
import { shouldGateStats } from '../use-should-gate-stats';
import { shouldShowPaywallAfterGracePeriod, shouldShowPaywallNotice } from '../use-stats-purchases';
import type { PlanUsage } from '../use-plan-usage-query';

jest.mock( '../../constants', () => ( {
	...jest.requireActual( '../../constants' ),
	COMMERCIAL_PAYWALL_KILLED: false,
} ) );

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = jest.fn();
	return config;
} );

const siteId = 123;

const walledApiPayload = {
	should_show_paywall: true,
	paywall_date_from: '2026-07-14',
	recent_usages: [],
} as unknown as PlanUsage;

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
	stats: { planUsage: { data: { [ siteId ]: selectPlanUsage( walledApiPayload ) } } },
};

describe( 'with COMMERCIAL_PAYWALL_KILLED flipped back to false', () => {
	beforeAll( () => {
		( isEnabled as jest.Mock ).mockImplementation( () => false );
	} );

	afterAll( () => {
		jest.clearAllMocks();
	} );

	it( 'preserves the sticker-derived fields through the query', () => {
		const usage = selectPlanUsage( walledApiPayload );

		expect( usage.should_show_paywall ).toBe( true );
		expect( usage.paywall_date_from ).toBe( '2026-07-14' );
	} );

	it( 'reports the paywall again for a walled commercial site', () => {
		expect( shouldShowPaywallAfterGracePeriod( walledCommercialSiteState, siteId ) ).toBe( true );
	} );

	it( 'honours persisted usage data again, rather than suppressing it on read', () => {
		const rehydratedState = {
			...walledCommercialSiteState,
			stats: { planUsage: { data: { [ siteId ]: walledApiPayload } } },
		};

		expect( shouldShowPaywallAfterGracePeriod( rehydratedState, siteId ) ).toBe( true );
		expect( shouldGateStats( rehydratedState, siteId, STAT_TYPE_CLICKS ) ).toBe( true );
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
} );
