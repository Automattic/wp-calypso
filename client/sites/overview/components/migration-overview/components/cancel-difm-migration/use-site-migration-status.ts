import { useSelect } from '@wordpress/data';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import type { SiteSelect } from '@automattic/data-stores';

/**
 * Custom hook to get site migration status.
 * @param siteId The ID of the site to check.
 * @returns Object containing site data and migration status.
 */
export function useSiteMigrationStatus( siteId: number ) {
	return useSelect(
		( select ) => {
			const site = ( select( SITE_STORE ) as SiteSelect ).getSite( siteId );
			return {
				isMigrationCompleted: site?.site_migration?.is_complete ?? false,
				isMigrationInProgress: site?.site_migration?.in_progress ?? false,
				site,
			};
		},
		[ siteId ]
	);
}
