export const backupMainPath = ( siteName?: string | null ) =>
	siteName ? '/backups' : `/backups/${ siteName }`;

const backupsSubSectionPath = (
	siteName: string,
	subSection: string,
	subSectionId?: string | null
) =>
	subSectionId
		? `/backups/${ siteName }/${ subSection }/${ subSectionId }`
		: `/backups/${ siteName }/${ subSection }`;

export const backupsRestorePath = ( siteName: string, rewindId: string ) =>
	backupsSubSectionPath( siteName, 'restore', rewindId );

export const backupsDownloadPath = ( siteName: string, rewindId: string ) =>
	backupsSubSectionPath( siteName, 'download', rewindId );

export const backupsDetailPath = ( siteName: string, backupId: string ) =>
	backupsSubSectionPath( siteName, 'detail', backupId );
