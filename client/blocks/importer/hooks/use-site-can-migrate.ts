import { useCallback, useEffect, useState } from 'react';
import { MigrationEnabledResponse } from 'calypso/data/site-migration/types';

export function useSiteCanMigrate( isMigrateFromWp: boolean ) {
	const siteCanMigrate = useCallback(
		( data: MigrationEnabledResponse ) => {
			if ( ! data ) {
				return false;
			}
			const { jetpack_activated, jetpack_compatible, migration_activated, migration_compatible } =
				data as MigrationEnabledResponse;

			return isMigrateFromWp
				? migration_activated && migration_compatible
				: jetpack_activated && jetpack_compatible;
		},
		[ isMigrateFromWp ]
	);

	return siteCanMigrate;
}

export function useSiteMigrateInfo( data: MigrationEnabledResponse ) {
	const [ sourceSiteId, setSourceSiteId ] = useState( 0 );
	useEffect( () => {
		if ( data ) {
			return setSourceSiteId( data.source_blog_id );
		}
		setSourceSiteId( 0 );
	}, [ data ] );
	return {
		sourceSiteId: sourceSiteId,
	};
}
