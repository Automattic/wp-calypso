import { A4A_SITES_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { addQueryArgs } from 'calypso/lib/url';

export const backupMainPath = ( siteName?: string | null, query = {} ) => {
	if ( isA8CForAgencies() ) {
		return addQueryArgs( query, `${ A4A_SITES_LINK }/overview/${ siteName }/jetpack-backup` );
	}
	return siteName ? addQueryArgs( query, `/backup/${ siteName }` ) : '/backup';
};

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
