/**
 * External dependencies
 */
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { rewindBackup } from 'state/activity-log/actions';
import Confirm from './confirm';
import getBackupProgress from 'state/selectors/get-backup-progress';
import QueryRewindBackupStatus from 'components/data/query-rewind-backup-status';
import QueryRewindState from 'components/data/query-rewind-state';
import Queued from './queued';
import Ready from './ready';
import { BackupProgress } from './types';
import getRewindBackupProgressRequestStatus from 'state/selectors/get-rewind-backup-progress-request-status';

enum DownloadState {
	DownloadInfoLoading,
	DownloadConfirm,
	DownloadQueued,
	DownloadReady,
}

interface Props {
	rewindId: string;
}

const getDownloadState = (
	backupProgress: BackupProgress | null,
	backupProgressRequestStatus: undefined | 'pending' | 'success',
	rewindId: string,
	hasRequestedDownload: boolean
) => {
	if ( undefined === backupProgressRequestStatus || 'pending' === backupProgressRequestStatus ) {
		return DownloadState.DownloadInfoLoading;
	} else if ( null === backupProgress ) {
		return DownloadState.DownloadConfirm;
	} else if (
		backupProgress.rewindId === rewindId &&
		backupProgress.validUntil &&
		backupProgress.url
	) {
		return DownloadState.DownloadReady;
	}
	return hasRequestedDownload ? DownloadState.DownloadQueued : DownloadState.DownloadConfirm;
};

const BackupRestorePage = ( { rewindId }: Props ) => {
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	// const rewindState = useSelector( state => getRewindState( state, siteId ) );
	const backupProgress: BackupProgress | null = useSelector( state =>
		getBackupProgress( state, siteId )
	);

	const backupProgressRequestStatus: undefined | 'pending' | 'success' = useSelector( state =>
		getRewindBackupProgressRequestStatus( state, siteId )
	);

	// The QueryRewindBackupStatus component will poll whenever there is a download id, so only retrieve it if the download is in progress
	const downloadId = backupProgress?.rewindId === rewindId ? backupProgress?.downloadId : null;

	const [ hasRequestedDownload, setHasRequestedDownload ] = useState( false );

	const requestDownload = useCallback( () => {
		if ( siteId && rewindId ) {
			dispatch( rewindBackup( siteId, rewindId, {} ) );
		}
	}, [ dispatch, rewindId, siteId ] );

	const onConfirm = () => {
		setHasRequestedDownload( true );
		requestDownload();
	};

	const downloadState = getDownloadState(
		backupProgress,
		backupProgressRequestStatus,
		rewindId,
		hasRequestedDownload
	);

	const render = () => {
		switch ( downloadState ) {
			case DownloadState.DownloadConfirm:
				return <Confirm rewindId={ rewindId } siteId={ siteId } onConfirm={ onConfirm } />;
			case DownloadState.DownloadQueued:
				return <Queued />;
			// case DownloadState.DownloadConfirm:
			// 	return <p>...</p>;
			case DownloadState.DownloadReady:
				return <Ready backupProgress={ backupProgress } siteId={ siteId } />;
			case DownloadState.DownloadInfoLoading:
				return <p>...</p>;
		}
	};

	return (
		<div>
			{ siteId && <QueryRewindState siteId={ siteId } /> }
			{ siteId && <QueryRewindBackupStatus downloadId={ downloadId } siteId={ siteId } /> }
			{ render() }
		</div>
	);
};

export default BackupRestorePage;
