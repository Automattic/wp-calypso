/**
 * @jest-environment jsdom
 */
import { GridPlan } from '@automattic/plans-grid-next';
import { renderHook } from '@testing-library/react';
import useSelectedFeature from '../use-selected-feature';

const mockFeature = {
	getSlug: () => 'feature-1',
	getTitle: () => 'Feature 1',
	getDescription: () => 'Description 1',
	availableForCurrentPlan: true,
	availableOnlyForAnnualPlans: false,
};

const mockGridPlans = [
	{
		planSlug: 'plan-1' as string,
		features: {
			wpcomFeatures: [ mockFeature ],
			storageFeature: {
				getSlug: () => 'feature-2',
				getTitle: () => 'Feature 2',
				getDescription: () => 'Description 2',
				availableForCurrentPlan: true,
				availableOnlyForAnnualPlans: false,
			},
			jetpackFeatures: [],
		},
		isVisible: true,
		tagline: 'Test Plan',
		planTitle: 'Test Plan',
		availableForPurchase: true,
		pricing: { price: 0 },
	},
] as unknown as GridPlan[];

describe( 'useSelectedFeature', () => {
	it( 'returns null when no feature or plan is selected', () => {
		const { result } = renderHook( () =>
			useSelectedFeature( {
				gridPlans: mockGridPlans,
				selectedFeature: undefined,
				selectedPlan: undefined,
			} )
		);
		expect( result.current ).toBeNull();
	} );

	it( 'returns null when plan is not found', () => {
		const { result } = renderHook( () =>
			useSelectedFeature( {
				gridPlans: mockGridPlans,
				selectedFeature: 'feature-1',
				selectedPlan: 'non-existent-plan',
			} )
		);
		expect( result.current ).toBeNull();
	} );

	it( 'finds feature in array type features', () => {
		const { result } = renderHook( () =>
			useSelectedFeature( {
				gridPlans: mockGridPlans,
				selectedFeature: 'feature-1',
				selectedPlan: 'plan-1',
			} )
		);
		expect( result.current ).toEqual( {
			slug: 'feature-1',
			title: 'Feature 1',
			description: 'Description 1',
		} );
	} );

	it( 'finds feature in object type features', () => {
		const { result } = renderHook( () =>
			useSelectedFeature( {
				gridPlans: mockGridPlans,
				selectedFeature: 'feature-2',
				selectedPlan: 'plan-1',
			} )
		);
		expect( result.current ).toEqual( {
			slug: 'feature-2',
			title: 'Feature 2',
			description: 'Description 2',
		} );
	} );

	it( 'returns null when feature is not found in plan', () => {
		const { result } = renderHook( () =>
			useSelectedFeature( {
				gridPlans: mockGridPlans,
				selectedFeature: 'non-existent-feature',
				selectedPlan: 'plan-1',
			} )
		);
		expect( result.current ).toBeNull();
	} );

	it( 'handles null gridPlans', () => {
		const { result } = renderHook( () =>
			useSelectedFeature( {
				gridPlans: null,
				selectedFeature: 'feature-1',
				selectedPlan: 'plan-1',
			} )
		);
		expect( result.current ).toBeNull();
	} );
} );
