import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { cloneDeep } from 'lodash';
import { Site } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

type QueryTuple = [ QueryKey, { sites?: Site[] } ];

export default function useGetSiteCache() {
	const queryClient = useQueryClient();

	return ( siteId: number ): Site | null => {
		const queries = queryClient.getQueriesData( {
			queryKey: [ 'jetpack-agency-dashboard-sites' ],
		} ) as QueryTuple[];
		const query = queries.find(
			( tuple ) => tuple[ 1 ]?.sites?.find( ( site: Site ) => site.a4a_site_id === siteId )
		);
		return cloneDeep( query?.[ 1 ]?.sites?.[ 0 ] || null );
	};
}
