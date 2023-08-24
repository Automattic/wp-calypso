import { useEffect } from 'react';
import { useMigrationEnabledInfoQuery } from 'calypso/data/site-migration/use-migration-enabled';
import { useDispatch, useSelector } from 'calypso/state';
import { requestSites } from 'calypso/state/sites/actions';
import { isRequestingSites, getSite } from 'calypso/state/sites/selectors';
import { SiteId } from 'calypso/types';

export function useSiteMigrateInfo(
	targetSiteId: SiteId,
	sourceSiteSlug: string,
	fetchMigrationEnabledOnMount: boolean
) {
	const {
		refetch,
		isFetching: isMigrationEnabledFetching,
		data,
	} = useMigrationEnabledInfoQuery( targetSiteId, sourceSiteSlug, fetchMigrationEnabledOnMount );

	const isRequestingAllSites = useSelector( ( state ) => isRequestingSites( state ) );
	const sourceSite = useSelector( ( state ) => getSite( state, data?.source_blog_id ) );
	const dispatch = useDispatch();

	useEffect( () => {
		// If has source site id and we do not have the source site, it means the data is not up to date, so we request the site
		if ( data?.source_blog_id && ! sourceSite && ! isRequestingAllSites ) {
			dispatch( requestSites() );
		}
	}, [ data?.source_blog_id, sourceSite, isRequestingAllSites, dispatch ] );

	return {
		sourceSiteId: data?.source_blog_id,
		sourceSite,
		siteCanMigrate: data?.can_migrate,
		fetchMigrationEnabledStatus: refetch,
		isFetchingData: isMigrationEnabledFetching || isRequestingAllSites,
	};
}
