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

let mockDifferentiationFeatures = [ 'differentiation-feature' ];

// Only the plan-constants lookup is stubbed; the FEATURE_* constants and helpers stay real so the
// branch under test is the real one.
jest.mock( '@automattic/calypso-products', () => ( {
	...jest.requireActual( '@automattic/calypso-products' ),
	applyTestFiltersToPlansList: () => ( {
		getVar42NoAiSignupWpcomFeatures: () => mockDifferentiationFeatures,
		getNewsletterSignupFeatures: () => [ 'newsletter-feature' ],
		get2023PricingGridSignupWpcomFeatures: () => [ 'default-feature' ],
		get2023PricingGridSignupJetpackFeatures: () => [],
		// The transform only walks wpcomFeatures when the plan has at least one annual-only
		// feature, so a non-empty list is needed for anything to come back at all.
		getAnnualPlansOnlyFeatures: () => [ 'annual-only-feature' ],
	} ),
} ) );

import { FEATURE_CUSTOM_DOMAIN, FEATURE_SIMPLE_PAYMENTS } from '@automattic/calypso-products';
import { renderHook } from '@testing-library/react';
import usePlanFeaturesForGridPlans from '../use-plan-features-for-grid-plans';
import type { GridPlan, PlansIntent } from '../../../types';
import type { FeatureList } from '@automattic/calypso-products';

const PERSONAL = 'personal-bundle';
const PREMIUM = 'value_bundle';

const ALL_FEATURES = {
	'differentiation-feature': { getSlug: () => 'differentiation-feature', getTitle: () => 'D' },
	'newsletter-feature': { getSlug: () => 'newsletter-feature', getTitle: () => 'N' },
	'default-feature': { getSlug: () => 'default-feature', getTitle: () => 'F' },
} as unknown as FeatureList;

const GRID_PLANS = [ { planSlug: PREMIUM } ] as Omit< GridPlan, 'features' >[];

function slugsFor( intent?: PlansIntent ) {
	const { result } = renderHook( () =>
		usePlanFeaturesForGridPlans( {
			gridPlans: GRID_PLANS,
			allFeaturesList: ALL_FEATURES,
			intent,
		} )
	);

	return result.current[ PREMIUM ].wpcomFeatures.map( ( feature ) => feature.getSlug() );
}

describe( 'usePlanFeaturesForGridPlans feature-list precedence', () => {
	it( 'uses the pricing-differentiation list when no intent curates its own', () => {
		expect( slugsFor( undefined ) ).toEqual( [ 'differentiation-feature' ] );
	} );

	it( 'keeps a curated intent list over the differentiation list', () => {
		// The regression this guards: the differentiation branch is checked first, so before
		// TAILORED_FEATURE_LIST_INTENTS it shadowed every intent branch.
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

describe( 'usePlanFeaturesForGridPlans badges', () => {
	const BADGE_FEATURES = {
		[ FEATURE_CUSTOM_DOMAIN ]: { getSlug: () => FEATURE_CUSTOM_DOMAIN, getTitle: () => 'Domain' },
		[ FEATURE_SIMPLE_PAYMENTS ]: {
			getSlug: () => FEATURE_SIMPLE_PAYMENTS,
			getTitle: () => 'Payments',
		},
	} as unknown as FeatureList;

	beforeEach( () => {
		mockDifferentiationFeatures = [ FEATURE_CUSTOM_DOMAIN, FEATURE_SIMPLE_PAYMENTS ];
	} );

	afterEach( () => {
		mockDifferentiationFeatures = [ 'differentiation-feature' ];
	} );

	function badgeFor( planSlug: string, featureSlug: string, hideFreeDomainBadge?: boolean ) {
		const { result } = renderHook( () =>
			usePlanFeaturesForGridPlans( {
				gridPlans: [ { planSlug } ] as Omit< GridPlan, 'features' >[],
				allFeaturesList: BADGE_FEATURES,
				hideFreeDomainBadge,
			} )
		);

		const feature = result.current[ planSlug ].wpcomFeatures.find(
			( wpcomFeature ) => wpcomFeature.getSlug() === featureSlug
		);
		// Without this, a missing feature would satisfy the toBeUndefined() assertion below.
		expect( feature ).toBeDefined();

		return feature?.badgeText;
	}

	it( 'shows the Free badge on the Personal custom domain by default', () => {
		expect( badgeFor( PERSONAL, FEATURE_CUSTOM_DOMAIN ) ).toBe( 'Free' );
	} );

	it( 'hides the Free badge on the Personal custom domain with hideFreeDomainBadge', () => {
		expect( badgeFor( PERSONAL, FEATURE_CUSTOM_DOMAIN, true ) ).toBeUndefined();
	} );

	it( 'keeps the New badge on Premium with hideFreeDomainBadge', () => {
		expect( badgeFor( PREMIUM, FEATURE_SIMPLE_PAYMENTS, true ) ).toBe( 'New' );
	} );
} );
