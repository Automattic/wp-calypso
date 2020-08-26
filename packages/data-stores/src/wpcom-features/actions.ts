/**
 * Internal dependencies
 */
import type { FeatureId } from './types';

export const addFeature = ( featureId: FeatureId ) => ( {
	type: 'ADD_FEATURE' as const,
	featureId,
} );

export const removeFeature = ( featureId: FeatureId ) => ( {
	type: 'REMOVE_FEATURE' as const,
	featureId,
} );

export type FeatureAction = ReturnType< typeof addFeature | typeof removeFeature >;
