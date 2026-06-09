import { Site } from '@automattic/api-core';
import { usePluginSites } from '../../hooks/use-plugin-sites';

export const useSitesById = () => {
	const { data: sites, isLoading: isLoadingSites } = usePluginSites();

	const map = new Map< number, Site >();

	if ( isLoadingSites || ! sites ) {
		return { isLoadingSites, sitesById: map };
	}

	const sitesById = sites
		.filter( ( site ) => site.capabilities?.update_plugins )
		.reduce( ( acc, site ) => {
			acc.set( site.ID, site );
			return acc;
		}, map );

	return { isLoadingSites, sitesById };
};
