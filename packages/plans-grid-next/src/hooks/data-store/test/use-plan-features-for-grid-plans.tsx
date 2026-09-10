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

// Only the plan-constants lookup is stubbed; the FEATURE_* constants and helpers stay real so the
// branch under test is the real one.
jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	applyTestFiltersToPlansList: () => ( {
		getVar42NoAiSignupWpcomFeatures: () => [ 'differentiation-feature' ],
		getNewsletterSignupFeatures: () => [ 'newsletter-feature' ],
		get2023PricingGridSignupWpcomFeatures: () => [ 'default-feature' ],
		get2023PricingGridSignupJetpackFeatures: () => [],
		// The transform only walks wpcomFeatures when the plan has at least one annual-only
		// feature, so a non-empty list is needed for anything to come back at all.
		getAnnualPlansOnlyFeatures: () => [ 'annual-only-feature' ],
	} ),
} ) );

import { renderHook } from '@testing-library/react';
import usePlanFeaturesForGridPlans from '../use-plan-features-for-grid-plans';
import type { GridPlan, PlansIntent } from '../../../types';
import type { FeatureList } from '@automattic/calypso-products';

const PREMIUM = 'value_bundle';

const ALL_FEATURES = {
	'differentiation-feature': { getSlug: () => 'differentiation-feature', getTitle: () => 'D' },
	'newsletter-feature': { getSlug: () => 'newsletter-feature', getTitle: () => 'N' },
	'default-feature': { getSlug: () => 'default-feature', getTitle: () => 'F' },
} as unknown as FeatureList;

const GRID_PLANS = [ { planSlug: PREMIUM } ] as Omit< GridPlan, 'features' >[];

function slugsFor( intent?: PlansIntent, useVar42NoAiFeatures = true ) {
	const { result } = renderHook( () =>
		usePlanFeaturesForGridPlans( {
			gridPlans: GRID_PLANS,
			allFeaturesList: ALL_FEATURES,
			intent,
			useVar42NoAiFeatures,
		} )
	);

	return result.current[ PREMIUM ].wpcomFeatures.map( ( feature ) => feature.getSlug() );
}

describe( 'usePlanFeaturesForGridPlans feature-list precedence', () => {
	it( 'uses the pricing-differentiation list when no intent curates its own', () => {
		expect( slugsFor( undefined ) ).toEqual( [ 'differentiation-feature' ] );
	} );

	it( 'keeps a curated intent list even when the differentiation list is enabled', () => {
		// The regression this guards: the differentiation branch is checked first, so before
		// TAILORED_FEATURE_LIST_INTENTS it shadowed every intent branch, and which grid a
		// newsletter site saw depended on whether it carried the gating flag.
		expect( slugsFor( 'plans-newsletter' ) ).toEqual( [ 'newsletter-feature' ] );
	} );

	it( 'falls back to the default list for a curated intent with no list of its own', () => {
		// plans-p2 and plans-woocommerce share the default list rather than defining one.
		expect( slugsFor( 'plans-p2' ) ).toEqual( [ 'default-feature' ] );
	} );

	it( 'leaves non-curated intents on the differentiation list', () => {
		expect( slugsFor( 'plans-upgrade' ) ).toEqual( [ 'differentiation-feature' ] );
	} );
} );
