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
import { getSiteTitle } from 'state/sites/selectors';
import { rewindBackup } from 'state/activity-log/actions';
import { useLocalizedMoment } from 'components/localized-moment';
import Confirm from './confirm';
import getBackupProgressForRewindId from 'state/selectors/get-backup-progress-for-rewind-id';
import getRewindBackupProgressRequestStatus from 'state/selectors/get-rewind-backup-progress-request-status';
import InProgress from './in-progress';
import QueryRewindBackupStatus from 'components/data/query-rewind-backup-status';
import Ready from './ready';
import Placeholder from './placeholder';
interface Props {
	rewindId: string;
}

const BackupRestorePage = ( { rewindId }: Props ) => {
	const dispatch = useDispatch();

	const moment = useLocalizedMoment();
	const backupDateString: string = moment.unix( rewindId ).format( 'LLL' );
	const longBackupDateString: string = moment.unix( rewindId ).format( 'LLLL' );
	const siteId = useSelector( getSelectedSiteId );
	const siteTitle = useSelector( state => getSiteTitle( state, siteId ) );

	const backupProgressRequestStatus: string | null = useSelector( state =>
		getRewindBackupProgressRequestStatus( state, siteId )
	);

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
			// and that is because it hasn't been loaded yet
			if ( ! backupProgressRequestStatus || backupProgressRequestStatus !== 'success' ) {
				return <Placeholder />;
			}
			// or because there is no download or one being made
			return (
				<Confirm
					backupDateString={ backupDateString }
					onConfirm={ onConfirm }
					siteTitle={ siteTitle }
				/>
			);
			// the user has confirmed they want to download
		} else if ( null !== downloadId ) {
			return (
				<InProgress
					backupDateString={ backupDateString }
					precent={ backupProgress?.progress }
					siteTitle={ siteTitle }
				/>
			);
			// NaN progress means the backup finished
		} else if ( isNaN( backupProgress.progress ) ) {
			return (
				<Ready
					downloadUrl={ downloadUrl }
					longBackupDateString={ longBackupDateString }
					siteTitle={ siteTitle }
				/>
			);
		}

		// todo: make error state, make sure it is actually an error
		return <p>...</p>;
	};

	return (
		<div>
			{ siteId && <QueryRewindBackupStatus downloadId={ downloadId } siteId={ siteId } /> }
			{ render() }
		</div>
	);
};

export default BackupRestorePage;
