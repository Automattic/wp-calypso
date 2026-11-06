/**
 * @jest-environment jsdom
 */

import {
	FEATURE_CONNECT_AI_AGENTS,
	FEATURE_DEV_TOOLS,
	FEATURE_GUIDED_WEBSITE_BUILDER,
	FEATURE_GUIDED_WEBSITE_BUILDER_LIMITED,
	FEATURE_PREMIUM_STORE_THEMES,
	FEATURE_SITE_STAGING_SITES,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	getFeaturesList,
	getPlanFeaturesGroupedForComparisonGrid,
} from '@automattic/calypso-products';
import { renderHook } from '@testing-library/react';
import usePlanFeaturesForGridPlans from '../use-plan-features-for-grid-plans';
import useRestructuredPlanFeaturesForComparisonGrid from '../use-restructured-plan-features-for-comparison-grid';
import type { GridPlan } from '../../../types';

const PAID_PLANS = [ PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE ];

const toGridPlans = ( planSlugs: string[] ) =>
	planSlugs.map( ( planSlug ) => ( { planSlug } ) ) as Omit< GridPlan, 'features' >[];

function cardFeatures( planSlug: string, useMcpFeature: boolean ) {
	const { result } = renderHook( () =>
		usePlanFeaturesForGridPlans( {
			gridPlans: toGridPlans( [ planSlug ] ),
			allFeaturesList: getFeaturesList(),
			usePlansGridRedesignFeatures: true,
			useMcpFeature,
		} )
	);

	return result.current[ planSlug ].wpcomFeatures;
}

const cardFeatureSlugs = ( planSlug: string, useMcpFeature: boolean ) =>
	cardFeatures( planSlug, useMcpFeature ).map( ( feature ) => feature.getSlug() );

const comparisonRows = ( useMcpFeature: boolean ) =>
	Object.values(
		getPlanFeaturesGroupedForComparisonGrid( { isExperimentVariant: true, useMcpFeature } )
	).flatMap( ( group ) => group?.getFeatures() ?? [] );

describe( 'mcp_features experiment variant', () => {
	describe( 'plan cards', () => {
		it.each( PAID_PLANS )( 'lists AI agents instead of premium themes on %s', ( planSlug ) => {
			const slugs = cardFeatureSlugs( planSlug, true );
			const builderIndex = slugs.findIndex(
				( slug ) =>
					slug === FEATURE_GUIDED_WEBSITE_BUILDER || slug === FEATURE_GUIDED_WEBSITE_BUILDER_LIMITED
			);

			expect( slugs[ builderIndex + 1 ] ).toBe( FEATURE_CONNECT_AI_AGENTS );
			expect( slugs ).not.toContain( WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED );
			expect( slugs ).not.toContain( FEATURE_PREMIUM_STORE_THEMES );
		} );

		it.each( PAID_PLANS )( 'keeps premium themes in control on %s', ( planSlug ) => {
			const slugs = cardFeatureSlugs( planSlug, false );

			expect( slugs ).not.toContain( FEATURE_CONNECT_AI_AGENTS );
			expect(
				slugs.includes( WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED ) ||
					slugs.includes( FEATURE_PREMIUM_STORE_THEMES )
			).toBe( true );
		} );

		it( 'leaves the Free plan alone', () => {
			expect( cardFeatureSlugs( PLAN_FREE, true ) ).toEqual( cardFeatureSlugs( PLAN_FREE, false ) );
		} );
	} );

	describe( 'staging site', () => {
		it.each( [
			[ PLAN_BUSINESS, false ],
			[ PLAN_BUSINESS, true ],
			[ PLAN_ECOMMERCE, false ],
			[ PLAN_ECOMMERCE, true ],
		] )( 'replaces the dev tools on %s with useMcpFeature %s', ( planSlug, useMcpFeature ) => {
			const features = cardFeatures( planSlug, useMcpFeature );
			const stagingFeature = features.find(
				( feature ) => feature.getSlug() === FEATURE_SITE_STAGING_SITES
			);

			expect( stagingFeature?.getTitle() ).toBe( 'Staging site' );
			expect( features.map( ( feature ) => feature.getSlug() ) ).not.toContain( FEATURE_DEV_TOOLS );
		} );
	} );

	describe( 'comparison grid', () => {
		it( 'has an AI agents row in the variant only', () => {
			expect( comparisonRows( true ) ).toContain( FEATURE_CONNECT_AI_AGENTS );
			expect( comparisonRows( false ) ).not.toContain( FEATURE_CONNECT_AI_AGENTS );
		} );

		it( 'includes AI agents from Personal up, but not on Free', () => {
			const { result } = renderHook( () =>
				useRestructuredPlanFeaturesForComparisonGrid( {
					gridPlans: toGridPlans( [ PLAN_FREE, ...PAID_PLANS ] ),
					allFeaturesList: getFeaturesList(),
				} )
			);

			const hasAgentsFeature = ( planSlug: string ) =>
				result.current[ planSlug ].wpcomFeatures.some(
					( feature ) => feature.getSlug() === FEATURE_CONNECT_AI_AGENTS
				);

			expect( hasAgentsFeature( PLAN_FREE ) ).toBe( false );
			expect( PAID_PLANS.every( hasAgentsFeature ) ).toBe( true );
		} );
	} );
} );
