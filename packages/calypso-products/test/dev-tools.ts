import {
	FEATURE_DEV_TOOLS,
	FEATURE_DEV_TOOLS_GIT,
	FEATURE_DEV_TOOLS_SSH,
	FEATURE_SFTP,
	FEATURE_SITE_STAGING_SITES,
	FEATURE_SSH,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	WPCOM_FEATURES_GITHUB_DEPLOYMENTS,
	getFeatureByKey,
	getPlan,
} from '../src';
import type { WPComPlan } from '../src';

const DEV_TOOLS_ROWS = [ FEATURE_DEV_TOOLS_GIT, FEATURE_DEV_TOOLS_SSH ];
const DEV_TOOLS_ABILITIES = [ FEATURE_SFTP, FEATURE_SSH, WPCOM_FEATURES_GITHUB_DEPLOYMENTS ];

const plan = ( slug: string ) => getPlan( slug ) as WPComPlan;

const promoLists = ( slug: string ) => [
	plan( slug ).get2023PricingGridSignupWpcomFeatures?.() ?? [],
	plan( slug ).getVar42NoAiSignupWpcomFeatures?.() ?? [],
	plan( slug ).getCheckoutFeatures?.() ?? [],
	plan( slug ).getCancellationFeatures?.() ?? [],
	plan( slug ).getVisualSplitBusinessFeatures?.() ?? [],
	plan( slug ).getVisualSplitCommerceFeatures?.() ?? [],
];

describe( 'dev tools on all paid plans', () => {
	it( 'moves the dev tools comparison rows from Business to Personal', () => {
		for ( const list of [
			plan( PLAN_PERSONAL ).get2023PlanComparisonFeatureOverride?.() ?? [],
			plan( PLAN_PERSONAL ).get2023PlanComparisonFeatureOverrideForExperiment?.() ?? [],
		] ) {
			expect( list ).toEqual( expect.arrayContaining( DEV_TOOLS_ROWS ) );
		}
		for ( const list of [
			plan( PLAN_BUSINESS ).get2023PlanComparisonFeatureOverride?.() ?? [],
			plan( PLAN_BUSINESS ).get2023PlanComparisonFeatureOverrideForExperiment?.() ?? [],
		] ) {
			expect( list ).not.toContain( FEATURE_DEV_TOOLS_GIT );
			expect( list ).not.toContain( FEATURE_DEV_TOOLS_SSH );
			expect( list ).toContain( FEATURE_SITE_STAGING_SITES );
		}
	} );

	it( 'no longer promotes dev tools on Business and Commerce', () => {
		for ( const slug of [ PLAN_BUSINESS, PLAN_ECOMMERCE ] ) {
			for ( const list of promoLists( slug ) ) {
				expect( list ).not.toContain( FEATURE_DEV_TOOLS );
				expect( list ).not.toContain( FEATURE_DEV_TOOLS_GIT );
				expect( list ).not.toContain( FEATURE_DEV_TOOLS_SSH );
			}
			expect( plan( slug ).get2023PricingGridSignupWpcomFeatures?.() ).toContain(
				FEATURE_SITE_STAGING_SITES
			);
		}
	} );

	it( 'keeps calling the staging site free, as the comparison grid does', () => {
		expect( getFeatureByKey( FEATURE_SITE_STAGING_SITES ).getTitle() ).toBe( 'Free staging site' );
	} );

	it( 'includes SFTP, SSH and GitHub Deployments in Personal and Premium abilities', () => {
		for ( const slug of [ PLAN_PERSONAL, PLAN_PREMIUM ] ) {
			expect( plan( slug ).getIncludedFeatures?.() ).toEqual(
				expect.arrayContaining( DEV_TOOLS_ABILITIES )
			);
		}
	} );
} );
