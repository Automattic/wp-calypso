import { vi } from 'vitest';
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

let mockFlagEnabled = false;
vi.mock( '@automattic/calypso-config', () => {
	const config = () => '';
	config.isEnabled = ( flag: string ) =>
		flag === 'hosting/dev-tools-all-paid-plans' && mockFlagEnabled;
	return { __esModule: true, default: config, isEnabled: config.isEnabled };
} );

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

describe( 'hosting/dev-tools-all-paid-plans', () => {
	afterEach( () => {
		mockFlagEnabled = false;
	} );

	describe( 'with the flag off', () => {
		it( 'lists the dev tools comparison rows on Business, not Personal', () => {
			for ( const list of [
				plan( PLAN_PERSONAL ).get2023PlanComparisonFeatureOverride?.() ?? [],
				plan( PLAN_PERSONAL ).get2023PlanComparisonFeatureOverrideForExperiment?.() ?? [],
			] ) {
				expect( list ).not.toEqual( expect.arrayContaining( [ FEATURE_DEV_TOOLS_GIT ] ) );
				expect( list ).not.toEqual( expect.arrayContaining( [ FEATURE_DEV_TOOLS_SSH ] ) );
			}
			for ( const list of [
				plan( PLAN_BUSINESS ).get2023PlanComparisonFeatureOverride?.() ?? [],
				plan( PLAN_BUSINESS ).get2023PlanComparisonFeatureOverrideForExperiment?.() ?? [],
			] ) {
				expect( list ).toEqual( expect.arrayContaining( DEV_TOOLS_ROWS ) );
			}
		} );

		it( 'promotes dev tools on Business and Commerce', () => {
			expect( plan( PLAN_BUSINESS ).get2023PricingGridSignupWpcomFeatures?.() ).toContain(
				FEATURE_DEV_TOOLS
			);
			expect( plan( PLAN_ECOMMERCE ).get2023PricingGridSignupWpcomFeatures?.() ).toContain(
				FEATURE_DEV_TOOLS
			);
			expect( plan( PLAN_BUSINESS ).getVisualSplitBusinessFeatures?.() ).toEqual(
				expect.arrayContaining( DEV_TOOLS_ROWS )
			);
		} );

		it( 'leaves SFTP, SSH and GitHub Deployments out of Personal and Premium abilities', () => {
			for ( const slug of [ PLAN_PERSONAL, PLAN_PREMIUM ] ) {
				const included = plan( slug ).getIncludedFeatures?.() ?? [];
				for ( const feature of DEV_TOOLS_ABILITIES ) {
					expect( included ).not.toContain( feature );
				}
			}
		} );
	} );

	describe( 'with the flag on', () => {
		beforeEach( () => {
			mockFlagEnabled = true;
		} );

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
			expect( getFeatureByKey( FEATURE_SITE_STAGING_SITES ).getTitle() ).toBe(
				'Free staging site'
			);
		} );

		it( 'includes SFTP, SSH and GitHub Deployments in Personal and Premium abilities', () => {
			for ( const slug of [ PLAN_PERSONAL, PLAN_PREMIUM ] ) {
				expect( plan( slug ).getIncludedFeatures?.() ).toEqual(
					expect.arrayContaining( DEV_TOOLS_ABILITIES )
				);
			}
		} );
	} );
} );
