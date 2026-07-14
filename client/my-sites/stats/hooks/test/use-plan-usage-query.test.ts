import { getUsageLimitStatus, PlanUsage } from '../use-plan-usage-query';

const buildUsage = ( viewsLimit: number, viewsCount: number ): PlanUsage =>
	( {
		views_limit: viewsLimit,
		current_usage: { views_count: viewsCount },
	} ) as PlanUsage;

describe( 'getUsageLimitStatus', () => {
	it( 'is neither near nor over limit well below the threshold', () => {
		expect( getUsageLimitStatus( buildUsage( 100000, 1000 ) ) ).toEqual( {
			isNearLimit: false,
			isOverLimit: false,
		} );
	} );

	it( 'is near limit but not over limit at the 90% threshold', () => {
		expect( getUsageLimitStatus( buildUsage( 100000, 90000 ) ) ).toEqual( {
			isNearLimit: true,
			isOverLimit: false,
		} );
	} );

	it( 'is both near limit and over limit once usage reaches the tier limit', () => {
		expect( getUsageLimitStatus( buildUsage( 100000, 100000 ) ) ).toEqual( {
			isNearLimit: true,
			isOverLimit: true,
		} );
	} );

	it( 'is both near limit and over limit past the tier limit', () => {
		expect( getUsageLimitStatus( buildUsage( 100000, 150000 ) ) ).toEqual( {
			isNearLimit: true,
			isOverLimit: true,
		} );
	} );

	it( 'treats a missing tier limit as neither near nor over limit', () => {
		expect( getUsageLimitStatus( buildUsage( 0, 500 ) ) ).toEqual( {
			isNearLimit: false,
			isOverLimit: false,
		} );
	} );

	it( 'treats undefined usage as neither near nor over limit', () => {
		expect( getUsageLimitStatus( undefined ) ).toEqual( {
			isNearLimit: false,
			isOverLimit: false,
		} );
	} );
} );
