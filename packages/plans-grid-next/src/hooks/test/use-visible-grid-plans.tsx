/**
 * @jest-environment jsdom
 */

import { PlanSlug } from '@automattic/calypso-products';
import { renderHook } from '@testing-library/react';
import React from 'react';
import PlansGridContextProvider from '../../grid-context';
import { GridPlan } from '../../types';
import { useVisibleGridPlans } from '../use-visible-grid-plans';
import type { TranslateResult } from 'i18n-calypso';

// Mock the hooks we're using
jest.mock( '@automattic/data-stores', () => ( {
	Plans: {
		useCurrentPlanTerm: jest.fn(),
	},
} ) );

jest.mock( '../../hooks/data-store/use-plan-billing-period', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

// Helper to create a mock GridPlan
const createMockGridPlan = ( slug: PlanSlug ): GridPlan => ( {
	planSlug: slug,
	pricing: {
		originalPrice: { monthly: 10, full: 20 },
		discountedPrice: { monthly: 5, full: 10 },
	},
	isVisible: true,
	features: {
		wpcomFeatures: [],
		jetpackFeatures: [],
	},
	tagline: '',
	planTitle: '',
	availableForPurchase: true,
} );

describe( 'useVisibleGridPlans', () => {
	const mockGridPlans = [
		createMockGridPlan( 'free_plan' ),
		createMockGridPlan( 'personal-bundle' ),
		createMockGridPlan( 'value_bundle' ),
		createMockGridPlan( 'business-bundle' ),
		createMockGridPlan( 'ecommerce-bundle' ),
	];

	const wrapper = ( { children }: { children: React.ReactNode } ) => (
		<PlansGridContextProvider
			gridPlans={ mockGridPlans }
			intent={ undefined }
			siteId={ 2345 }
			allFeaturesList={ {} }
			useCheckPlanAvailabilityForPurchase={ () => ( {} ) }
			useAction={ () => ( {
				primary: {
					text: '' as TranslateResult,
					callback: () => {},
				},
			} ) }
			featureGroupMap={ {} }
		>
			{ children }
		</PlansGridContextProvider>
	);

	test( 'should show correct number of plans based on grid size', () => {
		const { result } = renderHook(
			() => useVisibleGridPlans( { gridSize: 'small', intervalType: 'yearly', siteId: 2345 } ),
			{ wrapper }
		);

		expect( result.current.visibleGridPlans ).toHaveLength( 2 );
	} );

	test( 'should always include current plan if it exists', () => {
		const { result } = renderHook(
			() =>
				useVisibleGridPlans( {
					gridSize: 'small',
					currentSitePlanSlug: 'value_bundle',
					intervalType: 'yearly',
					siteId: 2345,
				} ),
			{ wrapper }
		);

		expect( result.current.visibleGridPlans.map( ( plan ) => plan.planSlug ) ).toContain(
			'value_bundle'
		);
		expect( result.current.visibleGridPlans ).toHaveLength( 2 );
	} );

	test( 'should handle grid size changes correctly', () => {
		const { result, rerender } = renderHook(
			( { size }: { size: 'small' | 'large' } ) =>
				useVisibleGridPlans( {
					gridSize: size,
					currentSitePlanSlug: 'value_bundle',
					intervalType: 'yearly',
					siteId: 2345,
				} ),
			{
				wrapper,
				initialProps: { size: 'small' },
			}
		);

		expect( result.current.visibleGridPlans ).toHaveLength( 2 );
		rerender( { size: 'large' } );
		expect( result.current.visibleGridPlans ).toHaveLength( 4 );
	} );
} );
