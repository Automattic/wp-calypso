/**
 * Internal dependencies
 */
import {
	wpcomFreePlan,
	wpcomPremiumPlan,
	wpcomBusinessPlan,
	wpcomEcommercePlan,
	wpcomEnterprisePlan,
	wpcomVipPlan,
	jpFreePlan,
	jpPersonalPlan,
	jpPremiumPlan,
	jpBusinessPlan,
	jpSecurityDailyPlan,
	jpSecurityRealtimePlan,
	jpCompletePlan,
} from '../fixture';
import { hasSiteAnalyticsFeature } from '../utils';

describe( 'hasSiteAnalyticsFeature', () => {
	it( 'returns undefined if the site is not defined', () => {
		expect( hasSiteAnalyticsFeature() ).toBeUndefined();
	} );

	it( 'returns undefined if the site has no plan', () => {
		expect( hasSiteAnalyticsFeature( {} ) ).toBeUndefined();
	} );

	it( 'returns false if the site does not have the analytics feature', () => {
		expect( hasSiteAnalyticsFeature( { plan: wpcomFreePlan } ) ).toEqual( false );
		expect( hasSiteAnalyticsFeature( { plan: jpFreePlan } ) ).toEqual( false );
		expect( hasSiteAnalyticsFeature( { plan: jpPersonalPlan } ) ).toEqual( false );
	} );

	it( 'returns true if the site has the analytics feature', () => {
		expect( hasSiteAnalyticsFeature( { plan: wpcomPremiumPlan } ) ).toEqual( true );
		expect( hasSiteAnalyticsFeature( { plan: wpcomBusinessPlan } ) ).toEqual( true );
		expect( hasSiteAnalyticsFeature( { plan: wpcomEcommercePlan } ) ).toEqual( true );
		expect( hasSiteAnalyticsFeature( { plan: wpcomEnterprisePlan } ) ).toEqual( true );
		expect( hasSiteAnalyticsFeature( { plan: wpcomVipPlan } ) ).toEqual( true );
		expect( hasSiteAnalyticsFeature( { plan: jpPremiumPlan } ) ).toEqual( true );
		expect( hasSiteAnalyticsFeature( { plan: jpBusinessPlan } ) ).toEqual( true );
		expect( hasSiteAnalyticsFeature( { plan: jpSecurityDailyPlan } ) ).toEqual( true );
		expect( hasSiteAnalyticsFeature( { plan: jpSecurityRealtimePlan } ) ).toEqual( true );
		expect( hasSiteAnalyticsFeature( { plan: jpCompletePlan } ) ).toEqual( true );
	} );
} );
