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
// import Error from './error';
// import Finished from './finished';
import getRewindState from 'state/selectors/get-rewind-state';
// import InProgress from './in-progress';
import QueryRewindState from 'components/data/query-rewind-state';
import Queued from './queued';

enum DownloadState {
	DownloadConfirm,
	DownloadQueued,
}

interface Props {
	downloadId?: string;
}

//todo: move to dedicated types file
interface RewindState {
	state: string;
	// rewind?: {
	// 	status: 'queued' | 'running' | 'finished' | 'fail',
	// };
}

// const getRestoreState = ( rewindState: RewindState, hasRequestedRestore: boolean ) => {
// 	if ( ! rewindState?.rewind && ! hasRequestedRestore ) {
// 		return RestoreState.RestoreConfirm;
// 	} else if (
// 		( ! rewindState?.rewind && hasRequestedRestore ) ||
// 		rewindState?.rewind?.status === 'queued'
// 	) {
// 		return RestoreState.RestoreQueued;
// 	} else if ( rewindState?.rewind?.status === 'running' ) {
// 		return RestoreState.RestoreInProgress;
// 	} else if ( rewindState?.rewind?.status === 'finished' ) {
// 		return RestoreState.RestoreFinished;
// 	}
// 	return RestoreState.RestoreError;
// };

const getDownloadState = ( rewindState: RewindState, hasRequestedDownload: boolean ) => {
	return hasRequestedDownload ? DownloadState.DownloadQueued : DownloadState.DownloadConfirm;
};

const BackupRestorePage = ( { downloadId }: Props ) => {
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const rewindState = useSelector( state => getRewindState( state, siteId ) );

	const [ hasRequestedDownload, setHasRequestedDownload ] = useState( false );

	const requestDownload = useCallback( () => {
		if ( siteId && downloadId ) {
			dispatch( rewindBackup( siteId, downloadId, {} ) );
		}
	}, [ dispatch, downloadId, siteId ] );

	const onConfirm = () => {
		setHasRequestedDownload( true );
		requestDownload();
	};

	const downloadState = getDownloadState( rewindState, hasRequestedDownload );

	const render = () => {
		switch ( downloadState ) {
			case DownloadState.DownloadConfirm:
				return <Confirm downloadId={ downloadId } siteId={ siteId } onConfirm={ onConfirm } />;
			case DownloadState.DownloadQueued:
				return <Queued />;
		}
	};

	return (
		<div>
			{ siteId && <QueryRewindState siteId={ siteId } /> }
			{ render() }
		</div>
	);
};

export default BackupRestorePage;
