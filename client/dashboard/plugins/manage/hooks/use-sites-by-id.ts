import { Site } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { useAppContext } from '../../../app/context';

export const useSitesById = () => {
	const { queries } = useAppContext();
	const { data: sites, isLoading: isLoadingSites } = useQuery( queries.sitesQuery() );

	const map = new Map< number, Site >();

	if ( isLoadingSites || ! sites ) {
		return { isLoadingSites, sitesById: map };
	}

	const sitesById = sites
		.filter( ( site ) => site.capabilities.update_plugins )
		.reduce( ( acc, site ) => {
			acc.set( site.ID, site );
			return acc;
		}, map );

	return { isLoadingSites, sitesById };
};
