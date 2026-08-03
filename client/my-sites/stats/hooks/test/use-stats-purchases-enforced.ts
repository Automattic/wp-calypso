/**
 * Pins the other side of the kill switch: with COMMERCIAL_PAYWALL_KILLED flipped back to `false`,
 * the classifier paywall must enforce exactly as it did before STATS-387. Without this, nothing
 * proves the switch is reversible rather than simply dead.
 */
import { isEnabled } from '@automattic/calypso-config';
import { STAT_TYPE_CLICKS, STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS } from '../../constants';
import { shouldGateStats } from '../use-should-gate-stats';
import { shouldShowPaywallAfterGracePeriod, shouldShowPaywallNotice } from '../use-stats-purchases';

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

const walledCommercialSiteState = {
	sites: {
		features: {
			[ siteId ]: {
				data: {
					active: [],
				},
			},
		},
		items: {
			[ siteId ]: {
				jetpack: true,
				options: {
					is_wpcom_atomic: false,
					is_commercial: true,
				},
			},
		},
	},
	purchases: {
		data: [],
	},
	stats: {
		planUsage: {
			data: {
				[ siteId ]: {
					should_show_paywall: true,
				},
			},
		},
	},
};

describe( 'with COMMERCIAL_PAYWALL_KILLED flipped back to false', () => {
	beforeAll( () => {
		( isEnabled as jest.Mock ).mockImplementation( () => false );
	} );

	afterAll( () => {
		jest.clearAllMocks();
	} );

	it( 'reports the paywall again for a walled commercial site', () => {
		expect( shouldShowPaywallAfterGracePeriod( walledCommercialSiteState, siteId ) ).toBe( true );
	} );

	it( 'escalates the upgrade notice to its lockout variant again', () => {
		const walledWithStickerDate = {
			...walledCommercialSiteState,
			stats: {
				planUsage: {
					data: { [ siteId ]: { should_show_paywall: true, paywall_date_from: '2026-07-14' } },
				},
			},
		};

		expect( shouldShowPaywallNotice( walledWithStickerDate, siteId ) ).toBe( true );
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
