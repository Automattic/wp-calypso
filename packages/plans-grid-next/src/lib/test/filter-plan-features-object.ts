import filterUnusedFeaturesObject from '../filter-unused-features-object';
import type { GridPlan } from '../../types';
import type { FeatureObject } from '@automattic/calypso-products';

// Mock data for GridPlan and FeatureObject
const feature1 = { getSlug: () => 'feature1' } as FeatureObject;
const feature2 = { getSlug: () => 'feature2' } as FeatureObject;
const feature3 = { getSlug: () => 'feature3' } as FeatureObject;
const feature4 = { getSlug: () => 'feature4' } as FeatureObject;
const feature5 = { getSlug: () => 'feature5-jetpack' } as FeatureObject;
const feature6 = { getSlug: () => 'feature6-jetpack' } as FeatureObject;
const feature7 = { getSlug: () => 'feature7-conditional' } as FeatureObject;

const planA = {
	features: {
		wpcomFeatures: [ feature1, feature2 ],
		jetpackFeatures: [ feature5, feature6 ],
	},
} as GridPlan;

const planB = {
	features: {
		wpcomFeatures: [ feature2, feature3 ],
		jetpackFeatures: [ feature5, feature6 ],
	},
} as GridPlan;

describe( 'filterUnusedFeaturesObject', () => {
	it( 'should return an empty array when both plans and features are empty', () => {
		const filteredFeatures = filterUnusedFeaturesObject( [], [] );
		expect( filteredFeatures ).toEqual( [] );
	} );

	it( 'should return only the features used in any plan', () => {
		const filteredFeatures = filterUnusedFeaturesObject(
			[ planA, planB ],
			[ feature1, feature2, feature3, feature4, feature5, feature7 ]
		);
		expect( filteredFeatures ).toEqual( [ feature1, feature2, feature3, feature5 ] );
	} );

	it( 'should return an empty array when no features are used in plans', () => {
		const filteredFeatures = filterUnusedFeaturesObject( [], [ feature1 ] );
		expect( filteredFeatures ).toEqual( [] );
	} );

	it( 'should handle duplicate features across plans correctly', () => {
		const planC = {
			features: {
				wpcomFeatures: [ feature1, feature1 ],
				jetpackFeatures: [ feature5, feature6, feature6 ],
			},
		} as GridPlan;
		const filteredFeatures = filterUnusedFeaturesObject(
			[ planC ],
			[ feature1, feature2, feature6, feature7 ]
		);
		expect( filteredFeatures ).toEqual( [ feature1, feature6 ] );
	} );

	it( 'should handle invalid input gracefully', () => {
		const filteredFeatures = filterUnusedFeaturesObject( undefined as any, undefined as any );
		expect( filteredFeatures ).toEqual( [] );
	} );
} );
