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

enum DownloadState {
	DownloadConfirm,
	DownloadQueued,
	DownloadReady,
}

interface Props {
	rewindId: string;
}

const getDownloadState = (
	backupProgress: BackupProgress | null,
	hasRequestedDownload: boolean
) => {
	if ( null === backupProgress ) {
		return DownloadState.DownloadConfirm;
	} else if ( backupProgress.validUntil && backupProgress.url ) {
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

	const downloadState = getDownloadState( backupProgress, hasRequestedDownload );

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
