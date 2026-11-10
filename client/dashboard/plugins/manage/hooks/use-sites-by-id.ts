import { Site } from '@automattic/api-core';
import { sitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export const useSitesById = () => {
	const { data: sites, isLoading: isLoadingSites } = useQuery( sitesQuery() );

	const sitesById = useMemo( () => {
		if ( isLoadingSites ) {
			return new Map< number, Site >();
		}

		if ( ! sites ) {
			return undefined;
		}

		return sites
			.filter( ( site ) => site.capabilities?.update_plugins )
			.reduce( ( acc, site ) => {
				acc.set( site.ID, site );
				return acc;
			}, new Map< number, Site >() );
	}, [ isLoadingSites, sites ] );

	return { isLoadingSites, sitesById, hasSites: !! sites?.length };
};
