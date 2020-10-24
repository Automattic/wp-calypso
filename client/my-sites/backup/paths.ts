/**
 * Internal dependencies
 */
import { addQueryArgs } from 'calypso/lib/url';

export const backupMainPath = ( siteName?: string | null, query = {} ) =>
	siteName ? addQueryArgs( query, `/backup/${ siteName }` ) : '/backup';

const backupSubSectionPath = (
	siteName: string,
	subSection: string,
	subSectionId?: string | null
) =>
	subSectionId
		? `/backup/${ siteName }/${ subSection }/${ subSectionId }`
		: `/backup/${ siteName }/${ subSection }`;

export const backupRestorePath = ( siteName: string, rewindId: string ) =>
	backupSubSectionPath( siteName, 'restore', rewindId );

export const backupDownloadPath = ( siteName: string, rewindId: string ) =>
	backupSubSectionPath( siteName, 'download', rewindId );
