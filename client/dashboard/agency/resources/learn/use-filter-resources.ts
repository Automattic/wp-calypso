import { useMemo } from 'react';
import type { ResourceItem } from './types';

const MAX_TOP_RESOURCES = 3;

/**
 * Custom hook to filter resources into different sections
 * @param resources - Array of all resources
 * @returns Object containing filtered resource arrays for each section
 */
export function useFilterResources( resources: ResourceItem[] ) {
	const topResources = useMemo( () => {
		return resources.filter( ( resource ) => resource.isFeatured ).slice( 0, MAX_TOP_RESOURCES );
	}, [ resources ] );

	const browseAllResources = useMemo( () => {
		const displayedTopResourceIds = new Set( topResources.map( ( resource ) => resource.id ) );

		return resources.filter( ( resource ) => ! displayedTopResourceIds.has( resource.id ) );
	}, [ resources, topResources ] );

	return {
		topResources,
		browseAllResources,
	};
}
