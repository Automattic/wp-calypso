/**
 * External dependencies
 */
import { Moment } from 'moment';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import { INDEX_FORMAT } from 'landing/jetpack-cloud/sections/backups/backups-status/utils';

export const backupsStatusPath = ( siteName?: string | null, date: Moment | null = null ) => {
	const query = date ? { date: date.format( INDEX_FORMAT ) } : {};

	return siteName ? addQueryArgs( query, `/backups/${ siteName }` ) : '/backups';
};

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
