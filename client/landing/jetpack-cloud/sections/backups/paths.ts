export const backupMainPath = ( siteName?: string | null ) =>
	siteName ? '/backups' : `/backups/${ siteName }`;

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
