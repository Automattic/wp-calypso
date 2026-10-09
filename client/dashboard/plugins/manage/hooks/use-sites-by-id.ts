import { Site } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAppContext } from '../../../app/context';

export const useSitesById = () => {
	const { queries } = useAppContext();
	const { data: sites, isLoading: isLoadingSites } = useQuery( queries.sitesQuery() );

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

	return { isLoadingSites, sitesById };
};
