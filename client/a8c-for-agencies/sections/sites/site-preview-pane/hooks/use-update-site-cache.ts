import { QueryKey, useQueryClient } from '@tanstack/react-query';
import { cloneDeep } from 'lodash';
import { Site } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

type QueryData = { sites?: Site[] };
type QueryTuple = [ QueryKey, QueryData ];

export default function useUpdateSiteCache< T >( updater: ( site: Site, context: T ) => Site ) {
	const queryClient = useQueryClient();

	return ( siteId: number, context: T ) => {
		const queries = queryClient.getQueriesData( {
			queryKey: [ 'jetpack-agency-dashboard-sites' ],
		} ) as QueryTuple[];

		queries.forEach( ( [ queryKey, data ] ) => {
			const siteIndex = ( ( data as QueryData )?.sites || [] ).findIndex(
				( site: Site ) => site.a4a_site_id === siteId
			);

			if ( siteIndex === -1 ) {
				return;
			}

			const newData = cloneDeep( data as QueryData );
			if ( newData.sites ) {
				newData.sites[ siteIndex ] = updater( newData.sites[ siteIndex ], context );
			}

			queryClient.setQueryData( queryKey, newData );
		} );
	};
}
