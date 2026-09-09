/**
 * @jest-environment jsdom
 */

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
	translate: ( text: string ) => text,
	// requireActual( calypso-products ) below reaches @automattic/components, which localizes a
	// class component at module scope.
	localize: ( component: unknown ) => component,
	useRtl: () => false,
} ) );

// Only the plan-constants lookup is stubbed; the FEATURE_* constants and the plan-type predicates
// stay real so the branches under test are the real ones.
jest.mock( '@automattic/calypso-products', () => {
	const actual = jest.requireActual( '@automattic/calypso-products' );

	return {
		...actual,
		applyTestFiltersToPlansList: () => ( {
			// Each list carries a marker slug identifying it, plus one real feature that earns a
			// pricing-differentiation pill, so one fixture covers both the list choice and the
			// presentation that comes with it.
			getVar42NoAiSignupWpcomFeatures: () => [
				'differentiation-feature',
				actual.FEATURE_SIMPLE_PAYMENTS,
			],
			getNewsletterSignupFeatures: () => [ 'newsletter-feature', actual.FEATURE_SIMPLE_PAYMENTS ],
			get2023PricingGridSignupWpcomFeatures: () => [
				'default-feature',
				actual.FEATURE_SIMPLE_PAYMENTS,
			],
			get2023PricingGridSignupJetpackFeatures: () => [],
			// The transform only walks wpcomFeatures when the plan has at least one annual-only
			// feature, so a non-empty list is needed for anything to come back at all.
			getAnnualPlansOnlyFeatures: () => [ 'annual-only-feature' ],
		} ),
	};
} );

import { FEATURE_SIMPLE_PAYMENTS } from '@automattic/calypso-products';
import { renderHook } from '@testing-library/react';
import usePlanFeaturesForGridPlans from '../use-plan-features-for-grid-plans';
import type { GridPlan, PlansIntent } from '../../../types';
import type { FeatureList } from '@automattic/calypso-products';

// Premium, because getPricingDifferentiationFeatureBadgeText() pills FEATURE_SIMPLE_PAYMENTS as
// "New" on premium plans.
const PREMIUM = 'value_bundle';

const feature = ( slug: string ) => ( { getSlug: () => slug, getTitle: () => slug } );

const ALL_FEATURES = {
	'differentiation-feature': feature( 'differentiation-feature' ),
	'newsletter-feature': feature( 'newsletter-feature' ),
	'default-feature': feature( 'default-feature' ),
	[ FEATURE_SIMPLE_PAYMENTS ]: feature( FEATURE_SIMPLE_PAYMENTS ),
} as unknown as FeatureList;

const GRID_PLANS = [ { planSlug: PREMIUM } ] as Omit< GridPlan, 'features' >[];

function featuresFor( intent?: PlansIntent ) {
	const { result } = renderHook( () =>
		usePlanFeaturesForGridPlans( {
			gridPlans: GRID_PLANS,
			allFeaturesList: ALL_FEATURES,
			intent,
			useVar42NoAiFeatures: true,
			showPricingDifferentiationFeaturePills: true,
			isExperimentVariant: true,
		} )
	);

	return result.current[ PREMIUM ].wpcomFeatures;
}

const slugsFor = ( intent?: PlansIntent ) => featuresFor( intent ).map( ( f ) => f.getSlug() );

describe( 'usePlanFeaturesForGridPlans feature-list precedence', () => {
	it( 'uses the pricing-differentiation list when no intent curates its own', () => {
		expect( slugsFor( undefined ) ).toEqual( [
			'differentiation-feature',
			FEATURE_SIMPLE_PAYMENTS,
		] );
	} );

	it( 'keeps a curated intent list even when the differentiation list is enabled', () => {
		// The regression this guards: the differentiation branch is checked first, so before
		// TAILORED_FEATURE_LIST_INTENTS it shadowed every intent branch, and which grid a
		// newsletter site saw depended on whether it carried the gating flag.
		expect( slugsFor( 'plans-newsletter' ) ).toEqual( [
			'newsletter-feature',
			FEATURE_SIMPLE_PAYMENTS,
		] );
	} );

	it( 'falls back to the default list for a curated intent with no list of its own', () => {
		// plans-p2 and plans-woocommerce share the default list rather than defining one.
		expect( slugsFor( 'plans-p2' ) ).toEqual( [ 'default-feature', FEATURE_SIMPLE_PAYMENTS ] );
	} );

	it( 'leaves non-curated intents on the differentiation list', () => {
		expect( slugsFor( 'plans-upgrade' ) ).toEqual( [
			'differentiation-feature',
			FEATURE_SIMPLE_PAYMENTS,
		] );
	} );
} );

describe( 'usePlanFeaturesForGridPlans differentiation presentation', () => {
	const badgeFor = ( intent?: PlansIntent ) =>
		featuresFor( intent ).find( ( f ) => f.getSlug() === FEATURE_SIMPLE_PAYMENTS )?.badgeText;

	const lastFeatureMarked = ( intent?: PlansIntent ) => {
		const features = featuresFor( intent );

		return !! features[ features.length - 1 ].isExperimentLastFeature;
	};

	it( 'pills a feature and marks the last one when the differentiation list is in use', () => {
		expect( badgeFor( undefined ) ).toBe( 'New' );
		expect( lastFeatureMarked( undefined ) ).toBe( true );
	} );

	it( 'drops the pills on a curated list', () => {
		// The pills and the stacked layout's trailing margin belong to the differentiation
		// presentation; on a curated list they would decorate a grid that is not part of it.
		expect( badgeFor( 'plans-newsletter' ) ).toBeUndefined();
	} );

	it( 'drops the last-feature margin marker on a curated list', () => {
		expect( lastFeatureMarked( 'plans-newsletter' ) ).toBe( false );
	} );
} );
