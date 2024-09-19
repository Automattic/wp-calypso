import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import { shouldGateStats } from '../use-should-gate-stats';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = jest.fn();
	return config;
} );

const siteId = 123;
const gatedStatType = 'statsSearchTerms';
const notGatedStatType = 'notGatedStatType';
const jetpackStatsAdvancedStatType = 'stats_devices_module';

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

	it( 'should gate basic stats for commercial jetpack sites having 1k views count without Stats commercial purchase', () => {
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
		const isGatedStats = shouldGateStats( mockState, siteId, gatedStatType );
		expect( isGatedStats ).toBe( true );
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
					},
				],
			},
		};
		const isGatedStats = shouldGateStats( mockState, siteId, jetpackStatsAdvancedStatType );
		expect( isGatedStats ).toBe( false );
	} );
} );
