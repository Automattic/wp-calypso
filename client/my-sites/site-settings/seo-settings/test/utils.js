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
import { hasSiteSeoFeature } from '../../utils';

describe( 'hasSiteSeoFeature', () => {
	const state = {
		ui: {
			selectedSiteId: 123,
		},
	};
	const siteId = state.ui.selectedSiteId;

	it( 'returns undefined if the site is not defined', () => {
		expect( hasSiteSeoFeature() ).toBeUndefined();
	} );

	it( 'returns undefined if the site has no plan', () => {
		expect( hasSiteSeoFeature( {} ) ).toBeUndefined();
	} );

	it( 'returns false if the site does not have the SEO feature', () => {
		expect( hasSiteSeoFeature( { plan: wpcomFreePlan, state, siteId } ) ).toEqual( false );
		expect( hasSiteSeoFeature( { plan: wpcomPremiumPlan, state, siteId } ) ).toEqual( false );
	} );

	it( 'returns true if the site has the SEO feature', () => {
		expect( hasSiteSeoFeature( { plan: wpcomBusinessPlan, state, siteId } ) ).toEqual( true );
		expect( hasSiteSeoFeature( { plan: wpcomEcommercePlan, state, siteId } ) ).toEqual( true );
		expect( hasSiteSeoFeature( { plan: wpcomEnterprisePlan, state, siteId } ) ).toEqual( true );
		expect( hasSiteSeoFeature( { plan: jpFreePlan, state, siteId } ) ).toEqual( true );
		expect( hasSiteSeoFeature( { plan: jpPersonalPlan, state, siteId } ) ).toEqual( true );
		expect( hasSiteSeoFeature( { plan: jpPremiumPlan, state, siteId } ) ).toEqual( true );
		expect( hasSiteSeoFeature( { plan: jpBusinessPlan, state, siteId } ) ).toEqual( true );
		expect( hasSiteSeoFeature( { plan: jpSecurityDailyPlan, state, siteId } ) ).toEqual( true );
		expect( hasSiteSeoFeature( { plan: jpSecurityRealtimePlan, state, siteId } ) ).toEqual( true );
		expect( hasSiteSeoFeature( { plan: jpCompletePlan, state, siteId } ) ).toEqual( true );
	} );
} );
