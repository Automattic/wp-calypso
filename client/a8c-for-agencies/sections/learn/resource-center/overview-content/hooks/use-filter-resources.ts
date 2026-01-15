import { useMemo } from '@wordpress/element';
import type { ResourceItem } from '../types';

/**
 * Custom hook to filter resources into different sections
 * @param resources - Array of all resources
 * @returns Object containing filtered resource arrays for each section
 */
export function useFilterResources( resources: ResourceItem[] ) {
	const topResources = useMemo( () => {
		return resources.filter( ( resource ) => resource.section === 'top-resources' );
	}, [ resources ] );

	const artOfTheDealResources = useMemo( () => {
		return resources.filter( ( resource ) => resource.section === 'art-of-the-deal' );
	}, [ resources ] );

	const browseAllResources = useMemo( () => {
		const displayedTopResourceIds = new Set(
			topResources.slice( 0, 3 ).map( ( resource ) => resource.id )
		);
		const displayedArtOfTheDealIds = new Set(
			artOfTheDealResources.map( ( resource ) => resource.id )
		);

		return resources.filter( ( resource ) => {
			// Include if not displayed in top resources or art of the deal sections
			return (
				! displayedTopResourceIds.has( resource.id ) &&
				! displayedArtOfTheDealIds.has( resource.id )
			);
		} );
	}, [ resources, topResources, artOfTheDealResources ] );

	return {
		topResources,
		artOfTheDealResources,
		browseAllResources,
	};
}
