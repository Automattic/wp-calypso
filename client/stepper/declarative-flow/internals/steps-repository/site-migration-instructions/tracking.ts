import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export const recordMigrationInstructionsLinkClick = ( linkname: string ) => {
	recordTracksEvent( 'calypso_site_migration_instructions_link_click', {
		linkname,
	} );
};
