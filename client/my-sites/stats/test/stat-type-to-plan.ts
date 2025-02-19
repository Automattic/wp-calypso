import config from '@automattic/calypso-config';
import { PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import {
	STAT_TYPE_CLICKS,
	STAT_TYPE_SEARCH_TERMS,
	STATS_FEATURE_DATE_CONTROL_LAST_7_DAYS,
} from '../constants';
import { statTypeToPlan } from '../stat-type-to-plan';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => 'development';
	config.isEnabled = jest.fn();
	return config;
} );

describe( 'statTypeToPlan', () => {
	it( 'should always return premium when stats/paid-wpcom-v3 is not enabled', () => {
		( config.isEnabled as jest.Mock ).mockImplementation( () => false );
		// Search terms is a commercial stats feature that requires the premium plan
		expect( statTypeToPlan( STAT_TYPE_SEARCH_TERMS ) ).toEqual( PLAN_PREMIUM );
		// Clicks is a paid stats feature that requires the personal plan, test the fallback on premium anyway when v3 is disabled.
		expect( statTypeToPlan( STAT_TYPE_CLICKS ) ).toEqual( PLAN_PREMIUM );
		// 7 Days is a free plan feature, this should not be gated but test we default to premium when the stat type doesn't make sense to query
		expect( statTypeToPlan( STATS_FEATURE_DATE_CONTROL_LAST_7_DAYS ) ).toEqual( PLAN_PREMIUM );
	} );

	it( 'should return personal when stats/paid-wpcom-v3 is enabled and the stat type is a personal plan feature', () => {
		( config.isEnabled as jest.Mock ).mockImplementation( () => true );
		// Search terms is a commercial stats feature that requires the premium plan
		expect( statTypeToPlan( STAT_TYPE_SEARCH_TERMS ) ).toEqual( PLAN_PREMIUM );
		// Clicks is a paid stats feature that requires the personal plan
		expect( statTypeToPlan( STAT_TYPE_CLICKS ) ).toEqual( PLAN_PERSONAL );
		// 7 Days is a free plan feature, this should not be gated but test we default to personal when the stat type doesn't make sense to query
		expect( statTypeToPlan( STATS_FEATURE_DATE_CONTROL_LAST_7_DAYS ) ).toEqual( PLAN_PERSONAL );
	} );
} );
