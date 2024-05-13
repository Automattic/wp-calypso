import { useQueryClient } from '@tanstack/react-query';
import { cloneDeep } from 'lodash';
import { Site } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

export default function useUpdateSiteCache< T >( updater: ( site: Site, context: T ) => Site ) {
	const queryClient = useQueryClient();

	// @todo only update rendered queries
	return ( siteId: number, context: T ) => {
		queryClient.setQueriesData( { queryKey: [ 'jetpack-agency-dashboard-sites' ] }, ( data ) => {
			const siteIndex = ( data?.sites || [] ).findIndex(
				( site: Site ) => site.a4a_site_id === siteId
			);

			if ( siteIndex === -1 ) {
				return undefined;
			}

			// react-query requires fresh copies so we need to clone the data.
			const newData = cloneDeep( data );
			newData.sites[ siteIndex ] = updater( newData.sites[ siteIndex ], context );
			return newData;
		} );
	};
}
