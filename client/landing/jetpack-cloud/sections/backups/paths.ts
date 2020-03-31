export const backupsMain = ( siteName?: string | null ) =>
	undefined === siteName ? '/backups' : `/backups/${ siteName }`;

const backupsSubSection = ( siteName: string, subSection: string, subSectionId?: string | null ) =>
	subSectionId
		? `/backups/${ siteName }/${ subSection }/${ subSectionId }`
		: `/backups/${ siteName }/${ subSection }`;

export const backupsRestore = ( siteName: string, rewindId: string ) =>
	backupsSubSection( siteName, 'restore', rewindId );

export const backupsDownload = ( siteName: string, rewindId: string ) =>
	backupsSubSection( siteName, 'download', rewindId );

export const backupsDetail = ( siteName: string, backupId: string ) =>
	backupsSubSection( siteName, 'detail', backupId );
