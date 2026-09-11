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

jest.mock( '@automattic/calypso-products', () => {
	const actual = jest.requireActual( '@automattic/calypso-products' );

	return {
		...actual,
		applyTestFiltersToPlansList: () => ( {
			get2023PlanComparisonFeatureOverrideForExperiment: () => [ 'experiment-feature' ],
			get2023PlanComparisonFeatureOverride: () => [ 'control-feature' ],
			get2023PricingGridSignupWpcomFeatures: () => [ 'default-feature' ],
			get2023PricingGridSignupJetpackFeatures: () => [],
			get2023PlanComparisonJetpackFeatureOverride: () => [],
			getVar42NoAiSignupWpcomFeatures: () => [ 'differentiation-feature' ],
			getAnnualPlansOnlyFeatures: () => [ 'annual-only-feature' ],
			// Stands in for the real per-plan labels, which say "Free support" under the experiment
			// and "Support from our expert team" otherwise (plans-list.tsx).
			getPlanComparisonFeatureLabels: ( { isExperimentVariant } = {} ) => ( {
				support: isExperimentVariant ? 'experiment copy' : 'control copy',
			} ),
		} ),
	};
} );

import { renderHook } from '@testing-library/react';
import useRestructuredPlanFeaturesForComparisonGrid from '../use-restructured-plan-features-for-comparison-grid';
import type { GridPlan, PlansIntent } from '../../../types';
import type { FeatureList } from '@automattic/calypso-products';

const PREMIUM = 'value_bundle';

const feature = ( slug: string ) => ( { getSlug: () => slug, getTitle: () => slug } );

const ALL_FEATURES = {
	'experiment-feature': feature( 'experiment-feature' ),
	'control-feature': feature( 'control-feature' ),
	'default-feature': feature( 'default-feature' ),
	'differentiation-feature': feature( 'differentiation-feature' ),
} as unknown as FeatureList;

const GRID_PLANS = [ { planSlug: PREMIUM } ] as Omit< GridPlan, 'features' >[];

function comparisonFor( intent?: PlansIntent ) {
	const { result } = renderHook( () =>
		useRestructuredPlanFeaturesForComparisonGrid( {
			gridPlans: GRID_PLANS,
			allFeaturesList: ALL_FEATURES,
			intent,
			useVar42NoAiFeatures: true,
			isExperimentVariant: true,
		} )
	);

	return result.current[ PREMIUM ];
}

describe( 'useRestructuredPlanFeaturesForComparisonGrid', () => {
	it( 'uses the experiment override and its labels when no intent curates its own list', () => {
		const { wpcomFeatures, comparisonGridFeatureLabels } = comparisonFor( undefined );

		expect( wpcomFeatures.map( ( f ) => f.getSlug() ) ).toEqual( [ 'experiment-feature' ] );
		expect( comparisonGridFeatureLabels ).toEqual( { support: 'experiment copy' } );
	} );

	it( 'labels a curated list with the control copy', () => {
		// The list and its labels have to come from the same side: experiment copy describes the
		// features the experiment override lists, so on a control list it mislabels the rows.
		const { wpcomFeatures, comparisonGridFeatureLabels } = comparisonFor( 'plans-newsletter' );

		expect( wpcomFeatures.map( ( f ) => f.getSlug() ) ).toEqual( [ 'control-feature' ] );
		expect( comparisonGridFeatureLabels ).toEqual( { support: 'control copy' } );
	} );
} );
