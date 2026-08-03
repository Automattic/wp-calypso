import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import {
	STAT_TYPE_CLICKS,
	STAT_TYPE_TOP_POSTS,
	STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS,
	STATS_FEATURE_DOWNLOAD_CSV,
	STATS_FEATURE_INTERVAL_DROPDOWN_WEEK,
	STATS_FEATURE_UTM_STATS,
	STATS_TYPE_DEVICE_STATS,
} from '../../constants';
import { selectPlanUsage } from '../use-plan-usage-query';
import { shouldGateStats } from '../use-should-gate-stats';
import type { PlanUsage } from '../use-plan-usage-query';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = jest.fn();
	return config;
} );

const siteId = 123;
const gatedStatType = STAT_TYPE_CLICKS;
const notGatedStatType = 'notGatedStatType';
const jetpackStatsAdvancedStatType = STATS_TYPE_DEVICE_STATS;

describe( 'shouldGateStats in Calypso', () => {
	beforeAll( () => {
		( isEnabled as jest.Mock ).mockImplementation( ( property: string ) => {
			switch ( property ) {
				case 'stats/paid-wpcom-v2':
					return true;
				case 'is_running_in_jetpack_site':
					return false;
			}
		} );
	} );

	afterAll( () => {
		jest.clearAllMocks();
	} );

	it( 'should not gate stats when site features are not loaded', () => {
		const mockState = {
			sites: {
				features: {
					[ siteId ]: {
						data: null,
					},
				},
				items: {
					[ siteId ]: {
						jetpack: false, // true for atomic sites
						options: {
							is_wpcom_atomic: false,
						},
					},
				},
			},
			purchases: {
				data: [],
			},
		};
		const isGatedStats = shouldGateStats( mockState, siteId, gatedStatType );
		expect( isGatedStats ).toBe( false );
	} );

	it( 'should gate stats when site is atomic without site feature', () => {
		const mockState = {
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
						jetpack: true, // true for atomic sites
						options: {
							is_wpcom_atomic: true,
						},
					},
				},
			},
			purchases: {
				data: [],
			},
		};
		const isGatedStats = shouldGateStats( mockState, siteId, gatedStatType );
		expect( isGatedStats ).toBe( true );
	} );

	it( 'should not gate stats when site is atomic and has paid stat feature', () => {
		const mockState = {
			sites: {
				features: {
					[ siteId ]: {
						data: {
							active: [ FEATURE_STATS_PAID ],
						},
					},
				},
				items: {
					[ siteId ]: {
						jetpack: true,
						options: {
							is_wpcom_atomic: true,
						},
					},
				},
			},
			purchases: {
				data: [],
			},
		};
		const isGatedStats = shouldGateStats( mockState, siteId, gatedStatType );
		expect( isGatedStats ).toBe( false );
	} );

	it( 'should not gate stats when site has paid stat feature', () => {
		const mockState = {
			sites: {
				features: {
					[ siteId ]: {
						data: {
							active: [ FEATURE_STATS_PAID ],
						},
					},
				},
				items: {
					[ siteId ]: {
						jetpack: false,
						options: {
							is_wpcom_atomic: false,
						},
					},
				},
			},
			purchases: {
				data: [],
			},
		};
		const isGatedStats = shouldGateStats( mockState, siteId, gatedStatType );
		expect( isGatedStats ).toBe( false );
	} );

	it( 'should not gate stats when statType is not in the gated list', () => {
		const mockState = {
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
						jetpack: false,
						options: {
							is_wpcom_atomic: false,
						},
					},
				},
			},
			purchases: {
				data: [],
			},
		};
		const isGatedStats = shouldGateStats( mockState, siteId, notGatedStatType );
		expect( isGatedStats ).toBe( false );
	} );

	it( 'should not gate stats when site is not atomic, site does not have paid stat feature, statType is not gated', () => {
		const mockState = {
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
						jetpack: false,
						options: {
							is_wpcom_atomic: false,
						},
					},
				},
			},
			purchases: {
				data: [],
			},
		};
		const isGatedStats = shouldGateStats( mockState, siteId, notGatedStatType );
		expect( isGatedStats ).toBe( false );
	} );

	it( 'should gate stats when site is not atomic and site does not have paid stat feature', () => {
		const mockState = {
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
						jetpack: false,
						options: {
							is_wpcom_atomic: false,
						},
					},
				},
			},
			purchases: {
				data: [],
			},
		};
		const isGatedStats = shouldGateStats( mockState, siteId, gatedStatType );
		expect( isGatedStats ).toBe( true );
	} );

	it( 'should gate advanced stats modules for Simple site without commercial stats feature', () => {
		const mockState = {
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
						jetpack: false,
						options: {
							is_wpcom_atomic: false,
						},
					},
				},
			},
			purchases: {
				data: [],
			},
		};
		const isGatedStats = shouldGateStats( mockState, siteId, jetpackStatsAdvancedStatType );
		expect( isGatedStats ).toBe( true );
	} );

	// Note: Once FEATURE_STATS_COMMERCIAL is introduced and fully rolled out,
	// we should replace FEATURE_STATS_PAID with FEATURE_STATS_COMMERCIAL in
	// the following test to ensure consistent gating logic for commercial stats.
	// @see: https://github.com/Automattic/wp-calypso/pull/97041

	it( 'should not gate advanced stats modules for Simple site with commercial stats feature', () => {
		const mockState = {
			sites: {
				features: {
					[ siteId ]: {
						data: {
							active: [ FEATURE_STATS_PAID ], // FEATURE_STATS_COMMERCIAL
						},
					},
				},
				items: {
					[ siteId ]: {
						jetpack: false,
						options: {
							is_wpcom_atomic: false,
						},
					},
				},
			},
			purchases: {
				data: [],
			},
		};
		const isGatedStats = shouldGateStats( mockState, siteId, jetpackStatsAdvancedStatType );
		expect( isGatedStats ).toBe( false );
	} );

	it( 'should not gate advanced stats for Atomic site with commercial stats feature', () => {
		const mockState = {
			sites: {
				features: {
					[ siteId ]: {
						data: {
							active: [ FEATURE_STATS_PAID ], // FEATURE_STATS_COMMERCIAL
						},
					},
				},
				items: {
					[ siteId ]: {
						jetpack: true,
						options: {
							is_wpcom_atomic: true,
						},
					},
				},
			},
			purchases: {
				data: [],
			},
		};
		const isGatedStats = shouldGateStats( mockState, siteId, jetpackStatsAdvancedStatType );
		expect( isGatedStats ).toBe( false );
	} );

	// The WPCOM paywall is a separate code path keyed off site features, and must not be
	// affected by the Jetpack commercial paywall kill switch (STATS-387). A commercial flag
	// and a paywall sticker on the site are irrelevant here.
	it.each( [
		[ 'Simple', false, false ],
		[ 'Atomic', true, true ],
	] )(
		'should keep gating stats for a %s site carrying a paywall sticker',
		( _, jetpack, atomic ) => {
			const mockState = {
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
							jetpack,
							options: {
								is_wpcom_atomic: atomic,
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

			expect( shouldGateStats( mockState, siteId, gatedStatType ) ).toBe( true );
			expect( shouldGateStats( mockState, siteId, notGatedStatType ) ).toBe( false );
		}
	);
} );

describe( 'shouldGateStats in Odyssey stats', () => {
	beforeAll( () => {
		( isEnabled as jest.Mock ).mockImplementation( ( property: string ) => {
			switch ( property ) {
				case 'stats/paid-wpcom-v2':
					return true;
				case 'is_running_in_jetpack_site':
					return true;
			}
		} );
	} );

	afterAll( () => {
		jest.clearAllMocks();
	} );

	it( 'should not gate basic stats for non-commercial jetpack sites without Stats commercial purchase', () => {
		const mockState = {
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
							is_commercial: false,
						},
					},
				},
			},
			purchases: {
				data: [],
			},
		};
		const isGatedStats = shouldGateStats( mockState, siteId, gatedStatType );
		expect( isGatedStats ).toBe( false );
	} );

	// The usage payload is put through `selectPlanUsage` rather than written by hand, so the
	// fixture holds what actually reaches the store for a site carrying the paywall sticker.
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
					[ siteId ]: selectPlanUsage( {
						should_show_paywall: true,
						paywall_date_from: '2026-07-14',
						recent_usages: [],
					} as unknown as PlanUsage ),
				},
			},
		},
	};

	// Everything the commercial paywall used to take away, itemised so a regression names itself.
	it.each( [
		[ 'basic modules', STAT_TYPE_TOP_POSTS ],
		[ 'clicks', gatedStatType ],
		[ 'date controls', STATS_FEATURE_DATE_CONTROL_LAST_30_DAYS ],
		[ 'interval dropdowns', STATS_FEATURE_INTERVAL_DROPDOWN_WEEK ],
		[ 'CSV export', STATS_FEATURE_DOWNLOAD_CSV ],
	] )(
		'should not gate %s for commercial jetpack sites past the paywall threshold (STATS-387)',
		( _, statType ) => {
			expect( shouldGateStats( walledCommercialSiteState, siteId, statType ) ).toBe( false );
		}
	);

	// Advanced stats are paid for every Jetpack site, commercial or not, so lifting the
	// commercial paywall must not open them.
	it.each( [
		[ 'devices', STATS_TYPE_DEVICE_STATS ],
		[ 'UTM', STATS_FEATURE_UTM_STATS ],
	] )(
		'should still gate advanced %s stats for commercial jetpack sites past the paywall threshold',
		( _, statType ) => {
			expect( shouldGateStats( walledCommercialSiteState, siteId, statType ) ).toBe( true );
		}
	);

	it( 'should not gate anything for a VIP site past the paywall threshold', () => {
		const vipState = {
			...walledCommercialSiteState,
			sites: {
				...walledCommercialSiteState.sites,
				items: {
					[ siteId ]: {
						jetpack: true,
						options: { is_wpcom_atomic: false, is_commercial: true, is_vip: true },
					},
				},
			},
		};

		expect( shouldGateStats( vipState, siteId, gatedStatType ) ).toBe( false );
		expect( shouldGateStats( vipState, siteId, jetpackStatsAdvancedStatType ) ).toBe( false );
	} );

	// The case the kill switch must leave alone: commercial, unpaid, but never past the threshold.
	it( 'should treat commercial jetpack sites below the paywall threshold exactly as before', () => {
		const belowThresholdState = { ...walledCommercialSiteState, stats: { planUsage: {} } };

		expect( shouldGateStats( belowThresholdState, siteId, gatedStatType ) ).toBe( false );
		expect( shouldGateStats( belowThresholdState, siteId, jetpackStatsAdvancedStatType ) ).toBe(
			true
		);
	} );

	it( 'should gate advanced stats for non-commercial jetpack sites without Stats commercial purchase', () => {
		const mockState = {
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
						},
					},
				},
			},
			purchases: {
				data: [],
			},
		};
		const isGatedStats = shouldGateStats( mockState, siteId, jetpackStatsAdvancedStatType );
		expect( isGatedStats ).toBe( true );
	} );

	it( 'should not gate advanced stats for commercial jetpack sites with a Stats commercial purchase', () => {
		const mockState = {
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
		const isGatedStats = shouldGateStats( mockState, siteId, jetpackStatsAdvancedStatType );
		expect( isGatedStats ).toBe( false );
	} );
} );
