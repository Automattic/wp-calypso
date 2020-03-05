/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { rewindRestore } from 'state/activity-log/actions';
import Confirm from './confirm';
import InProgress from './in-progress';
import Finished from './finished';
import Error from './error';
import QueryRewindRestoreStatus from 'components/data/query-rewind-restore-status';
import getRewindState from 'state/selectors/get-rewind-state';

enum RestoreState {
	RestoreConfirm,
	RestoreInProgress,
	RestoreFinished,
	RestoreError,
}

interface Props {
	restoreId?: string;
}

//todo: move to dedicated types file
interface RewindState {
	state: string;
	rewind?: {
		status: 'queued' | 'running' | 'finished';
	};
}

const getRestoreState = ( rewindState: RewindState ) => {
	if ( rewindState.state === 'uninitialized' || rewindState?.rewind?.status === 'queued' ) {
		return RestoreState.RestoreConfirm;
	} else if ( rewindState?.rewind?.status === 'running' ) {
		return RestoreState.RestoreInProgress;
	} else if ( rewindState?.rewind?.status === 'finished' ) {
		return RestoreState.RestoreFinished;
	}
	return RestoreState.RestoreError;
};

const BackupRestorePage = ( { restoreId }: Props ) => {
	const dispatch = useDispatch();

	const siteId = useSelector( getSelectedSiteId );
	const rewindState = useSelector( state => getRewindState( state, siteId ) );

	const onConfirm = useCallback(
		() => ( siteId && restoreId ? dispatch( rewindRestore( siteId, restoreId, {} ) ) : null ),
		[ dispatch, siteId, restoreId ]
	);

	const restoreState = getRestoreState( rewindState );

	return (
		<div>
			{ siteId && <QueryRewindRestoreStatus siteId={ siteId } /> }
			{ restoreState === RestoreState.RestoreConfirm && (
				<Confirm siteId={ siteId } restoreId={ restoreId } onConfirm={ onConfirm } />
			) }
			{ restoreState === RestoreState.RestoreInProgress && (
				<InProgress percent={ rewindState?.rewind?.progress ? rewindState?.rewind?.progress : 0 } />
			) }
			{ restoreState === RestoreState.RestoreFinished && <Finished /> }
			{ restoreState === RestoreState.RestoreError && <Error /> }
		</div>
	);
};

export default BackupRestorePage;
