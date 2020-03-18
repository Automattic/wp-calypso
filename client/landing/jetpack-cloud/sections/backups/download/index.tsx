/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { BackupProgress } from './types';
import { getSelectedSiteId } from 'state/ui/selectors';
import { rewindBackup } from 'state/activity-log/actions';
import { useLocalizedMoment } from 'components/localized-moment';
import Confirm from './confirm';
import getBackupProgressForRewindId from 'state/selectors/get-backup-progress-for-rewind-id';
import InProgress from './in-progress';
import QueryRewindBackupStatus from 'components/data/query-rewind-backup-status';
import Ready from './ready';
import Error from './error';

interface Props {
	rewindId: string;
}

const BackupDownloadPage = ( { rewindId }: Props ) => {
	const dispatch = useDispatch();

	const moment = useLocalizedMoment();

	const downloadTimestamp: string = moment.unix( rewindId ).format( 'LLL' );
	const longDownloadTimestamp: string = moment.unix( rewindId ).format( 'LLLL' );

	const siteId = useSelector( getSelectedSiteId );

	const backupProgress: BackupProgress | null = useSelector( state =>
		getBackupProgressForRewindId( state, siteId, rewindId )
	);

	const downloadUrl = backupProgress?.url;
	const requestDownload = useCallback( () => {
		if ( siteId && rewindId ) {
			dispatch( rewindBackup( siteId, rewindId, {} ) );
		}
	}, [ dispatch, rewindId, siteId ] );

	const onConfirm = () => {
		requestDownload();
	};

	// The QueryRewindBackupStatus component will poll whenever there is a download id, so only retrieve it if the download is in progress
	const downloadId =
		backupProgress && ! isNaN( backupProgress.progress ) ? backupProgress.downloadId : null;

	const render = () => {
		// there is no backup download creation info
		if ( null === backupProgress ) {
			return <Confirm downloadTimestamp={ downloadTimestamp } onConfirm={ onConfirm } />;
			// the user has confirmed they want to download
		} else if ( null !== downloadId ) {
			return (
				<InProgress
					longDownloadTimestamp={ longDownloadTimestamp }
					precent={ backupProgress?.progress }
				/>
			);
			// NaN progress means the backup finished
		} else if ( isNaN( backupProgress.progress ) ) {
			return <Ready downloadUrl={ downloadUrl } longDownloadTimestamp={ longDownloadTimestamp } />;
		}

		// todo: make error state, make sure it is actually an error
		return <Error error={ backupProgress?.error } />;
	};

	return (
		<div>
			{ siteId && <QueryRewindBackupStatus downloadId={ downloadId } siteId={ siteId } /> }
			{ render() }
		</div>
	);
};

export default BackupDownloadPage;
