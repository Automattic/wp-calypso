import { isBusinessPlan, isPremiumPlan, isEcommercePlan } from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import type { PlanProperties } from '../types';

const useFeaturedAdjacencyMatrix = ( visiblePlans: PlanProperties[] ) => {
	return useMemo( () => {
		const adjacencyMatrix: {
			[ key: string ]: {
				leftOfFeatured: boolean;
				rightOfFeatured: boolean;
				isOnlyFeatured?: boolean;
			};
		} = {};
		const featuredIndices = visiblePlans.reduce< number[] >( ( acc, { planName }, index ) => {
			const isfeatured =
				isBusinessPlan( planName ) || isPremiumPlan( planName ) || isEcommercePlan( planName );

			if ( isfeatured ) {
				acc.push( index );
			}

			return acc;
		}, [] );

		visiblePlans.forEach( ( { planName }, index ) => {
			let leftOfFeatured = false;
			let rightOfFeatured = false;

			featuredIndices.forEach( ( featuredIndex ) => {
				if ( featuredIndex === index - 1 ) {
					rightOfFeatured = true;
				}
				if ( featuredIndex === index + 1 ) {
					leftOfFeatured = true;
				}
			} );

			adjacencyMatrix[ planName ] = { leftOfFeatured, rightOfFeatured };
		} );

		if ( featuredIndices.length === 1 ) {
			adjacencyMatrix[ visiblePlans[ featuredIndices[ 0 ] ].planName ].isOnlyFeatured = true;
		}

		return adjacencyMatrix;
	}, [ visiblePlans ] );
};

export default useFeaturedAdjacencyMatrix;
