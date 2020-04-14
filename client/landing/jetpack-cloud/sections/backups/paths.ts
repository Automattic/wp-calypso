/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';

export const backupMainPath = ( siteName?: string | null, query = {} ) =>
	siteName ? addQueryArgs( query, `/backups/${ siteName }` ) : '/backups';

export const backupActivityPath = ( siteName?: string | null ) =>
	siteName ? `/backups/activity/${ siteName }` : '/backups/activity';

const backupSubSectionPath = (
	siteName: string,
	subSection: string,
	subSectionId?: string | null
) =>
	subSectionId
		? `/backups/${ siteName }/${ subSection }/${ subSectionId }`
		: `/backups/${ siteName }/${ subSection }`;

export const backupDetailPath = ( siteName: string, backupId: string ) =>
	backupSubSectionPath( siteName, 'detail', backupId );

export const backupRestorePath = ( siteName: string, rewindId: string ) =>
	backupSubSectionPath( siteName, 'restore', rewindId );

export const backupDownloadPath = ( siteName: string, rewindId: string ) =>
	backupSubSectionPath( siteName, 'download', rewindId );
