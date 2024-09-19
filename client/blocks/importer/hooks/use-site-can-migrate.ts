import { useEffect, useRef, useState } from 'react';
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
		status,
	} = useMigrationEnabledInfoQuery( targetSiteId, sourceSiteSlug, fetchMigrationEnabledOnMount );

	const isRequestingAllSites = useSelector( isRequestingSites );
	const sourceSite = useSelector( ( state ) => getSite( state, data?.source_blog_id ) );
	const dispatch = useDispatch();
	const [ isInitFetchingDone, setIsInitFetchingDone ] = useState( false );

	useEffect( () => {
		// If has source site id and we do not have the source site, it means the data is not up to date, so we request the site
		if ( data?.source_blog_id && ! sourceSite && ! isRequestingAllSites ) {
			dispatch( requestSites() );
		}
	}, [ data?.source_blog_id, sourceSite, isRequestingAllSites, dispatch ] );

	// use an effect that sets `siteCanMigrate` depending on whether the request ran to `true` or `false`, it should stay undefined until it's fetched the first time
	const [ siteCanMigrate, setSiteCanMigrate ] = useState< boolean | undefined >( undefined );
	const isFetchingData = isMigrationEnabledFetching || isRequestingAllSites;
	const prevIsFetchingData = useRef( isFetchingData );

	useEffect( () => {
		if ( status === 'success' ) {
			setSiteCanMigrate( data?.can_migrate );
		} else if ( status === 'error' ) {
			setSiteCanMigrate( false );
		}
	}, [ status, data?.can_migrate ] );

	useEffect( () => {
		if ( prevIsFetchingData.current === true && isFetchingData === false ) {
			setIsInitFetchingDone( true );
		}
		prevIsFetchingData.current = isFetchingData;
	}, [ isFetchingData ] );

	return {
		sourceSiteId: data?.source_blog_id,
		sourceSite,
		siteCanMigrate,
		fetchMigrationEnabledStatus: refetch,
		isFetchingData: isMigrationEnabledFetching || isRequestingAllSites,
		isInitFetchingDone: isInitFetchingDone,
	};
}
