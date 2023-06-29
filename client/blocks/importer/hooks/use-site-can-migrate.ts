import { useEffect, useState } from 'react';
import { MigrationEnabledResponse } from 'calypso/data/site-migration/types';
import { useMigrationEnabledInfoQuery } from 'calypso/data/site-migration/use-migration-enabled';
import { useDispatch, useSelector } from 'calypso/state';
import { requestSites } from 'calypso/state/sites/actions';
import { isRequestingSites, getSite } from 'calypso/state/sites/selectors';
import { SiteId } from 'calypso/types';

export function useSiteMigrateInfo(
	targetSiteId: SiteId,
	sourceSiteSlug: string,
	fetchMigrationEnabledOnMount: boolean,
	onfetchCallback?: ( checkCanSiteMigrate: boolean ) => void
) {
	const [ sourceSiteId, setSourceSiteId ] = useState( 0 );
	const [ siteCanMigrate, setSiteCanMigrate ] = useState( false );
	const isRequestingAllSites = useSelector( ( state ) => isRequestingSites( state ) );
	const sourceSite = useSelector( ( state ) => getSite( state, sourceSiteId ) );
	const dispatch = useDispatch();

	const resetMigrationEnabled = () => {
		setSiteCanMigrate( false );
		setSourceSiteId( 0 );
	};

	const checkCanSiteMigrate = ( data: MigrationEnabledResponse ) => {
		if ( ! data ) {
			return false;
		}
		const { jetpack_activated, jetpack_compatible, migration_activated, migration_compatible } =
			data as MigrationEnabledResponse;

		return (
			( migration_activated && migration_compatible ) || ( jetpack_activated && jetpack_compatible )
		);
	};

	const onMigrationEnabledSuccess = ( data: MigrationEnabledResponse ) => {
		const canMigrate = checkCanSiteMigrate( data );
		if ( canMigrate ) {
			setSiteCanMigrate( true );
			setSourceSiteId( data.source_blog_id );
		} else {
			resetMigrationEnabled();
		}
		onfetchCallback && onfetchCallback( canMigrate );
	};

	const onMigrationEnabledError = () => {
		resetMigrationEnabled();
		const canMigrate = false;
		onfetchCallback && onfetchCallback( canMigrate );
	};
	const { refetch, isFetching: isMigrationEnabledFetching } = useMigrationEnabledInfoQuery(
		targetSiteId,
		sourceSiteSlug,
		fetchMigrationEnabledOnMount,
		onMigrationEnabledSuccess,
		onMigrationEnabledError
	);

	useEffect( () => {
		// If has source site id and we do not have the source site, it means the data is not up to date, so we request the site
		if ( sourceSiteId && ! sourceSite && ! isRequestingAllSites ) {
			dispatch( requestSites() );
		}
	}, [ sourceSiteId, sourceSite, isRequestingAllSites, dispatch ] );

	return {
		sourceSiteId,
		sourceSite,
		siteCanMigrate,
		fetchMigrationEnabledStatus: refetch,
		isFetchingData: isMigrationEnabledFetching || isRequestingAllSites,
	};
}
