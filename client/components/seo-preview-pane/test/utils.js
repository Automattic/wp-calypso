/**
 * Internal dependencies
 */
import {
	wpcomFreePlan,
	wpcomPremiumPlan,
	wpcomBusinessPlan,
	wpcomEcommercePlan,
	wpcomEnterprisePlan,
	jpFreePlan,
	jpPersonalPlan,
	jpPremiumPlan,
	jpBusinessPlan,
	jpSecurityDailyPlan,
	jpSecurityRealtimePlan,
	jpCompletePlan,
} from '../fixture';
import { hasSiteSeoFeature } from '../utils';

describe( 'hasSiteSeoFeature', () => {
	it( 'returns undefined if the site is not defined', () => {
		expect( hasSiteSeoFeature() ).toBeUndefined();
	} );

	it( 'returns undefined if the site has no plan', () => {
		expect( hasSiteSeoFeature( {} ) ).toBeUndefined();
	} );

	it( 'returns false if the site does not have the SEO feature', () => {
		expect( hasSiteSeoFeature( { plan: wpcomFreePlan } ) ).toEqual( false );
		expect( hasSiteSeoFeature( { plan: wpcomPremiumPlan } ) ).toEqual( false );
		expect( hasSiteSeoFeature( { plan: jpFreePlan } ) ).toEqual( false );
		expect( hasSiteSeoFeature( { plan: jpPersonalPlan } ) ).toEqual( false );
		expect( hasSiteSeoFeature( { plan: jpSecurityDailyPlan } ) ).toEqual( false );
		expect( hasSiteSeoFeature( { plan: jpSecurityRealtimePlan } ) ).toEqual( false );
		expect( hasSiteSeoFeature( { plan: jpCompletePlan } ) ).toEqual( false );
	} );

	it( 'returns true if the site has the SEO feature', () => {
		expect( hasSiteSeoFeature( { plan: wpcomBusinessPlan } ) ).toEqual( true );
		expect( hasSiteSeoFeature( { plan: wpcomEcommercePlan } ) ).toEqual( true );
		expect( hasSiteSeoFeature( { plan: wpcomEnterprisePlan } ) ).toEqual( true );
		expect( hasSiteSeoFeature( { plan: jpPremiumPlan } ) ).toEqual( true );
		expect( hasSiteSeoFeature( { plan: jpBusinessPlan } ) ).toEqual( true );
	} );
} );
