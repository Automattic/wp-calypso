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

export const backupClonePath = ( siteName: string ) => backupSubSectionPath( siteName, 'clone' );

export const backupContentsPath = ( siteName: string, rewindId: string ) =>
	backupSubSectionPath( siteName, 'contents', rewindId );

export const backupGranularRestorePath = ( siteName: string, rewindId: string ) =>
	backupSubSectionPath( siteName, 'granular-restore', rewindId );
