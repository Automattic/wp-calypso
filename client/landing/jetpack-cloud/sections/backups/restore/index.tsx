/**
 * External dependencies
 */
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	defaultRewindConfig,
	RewindConfig,
} from 'landing/jetpack-cloud/components/rewind-config/types';
import { rewindRestore } from 'state/activity-log/actions';
import { useLocalizedMoment } from 'components/localized-moment';
import Confirm from './confirm';
import DocumentHead from 'components/data/document-head';
import Error from './error';
import Finished from './finished';
import getRewindState from 'state/selectors/get-rewind-state';
import getSiteTitle from 'state/sites/selectors/get-site-title';
import Gridicon from 'components/gridicon';
import InProgress from './in-progress';
import Main from 'components/main';
import QueryRewindRestoreStatus from 'components/data/query-rewind-restore-status';
import SidebarNavigation from 'my-sites/sidebar-navigation';

/**
 * Style dependencies
 */
import './style.scss';

enum RestoreState {
	RestoreConfirm,
	RestoreQueued,
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
		status: 'queued' | 'running' | 'finished' | 'fail';
	};
}

const getRestoreState = ( rewindState: RewindState, hasRequestedRestore: boolean ) => {
	if ( ! rewindState?.rewind && ! hasRequestedRestore ) {
		return RestoreState.RestoreConfirm;
	} else if (
		( ! rewindState?.rewind && hasRequestedRestore ) ||
		[ 'queued', 'running' ].includes( rewindState?.rewind?.status )
	) {
		return RestoreState.RestoreInProgress;
	} else if ( rewindState?.rewind?.status === 'finished' ) {
		return RestoreState.RestoreFinished;
	}
	return RestoreState.RestoreError;
};

const BackupRestorePage = ( { restoreId }: Props ) => {
	const dispatch = useDispatch();

	const [ restoreSettings, setRestoreSettings ] = useState< RewindConfig >( defaultRewindConfig );

	const siteId = useSelector( getSelectedSiteId );
	const rewindState = useSelector( state => getRewindState( state, siteId ) );
	const siteTitle = useSelector( state => ( siteId ? getSiteTitle( state, siteId ) : null ) );

	const moment = useLocalizedMoment();
	const restoreTimestamp: string = moment.unix( restoreId ).format( 'LLL' );

	const [ hasRequestedRestore, setHasRequestedRestore ] = useState( false );

	const requestRestore = useCallback( () => {
		if ( siteId && restoreId ) {
			dispatch( rewindRestore( siteId, restoreId, restoreSettings ) );
		}
	}, [ dispatch, siteId, restoreId, restoreSettings ] );

	const onConfirm = () => {
		setHasRequestedRestore( true );
		requestRestore();
	};

	const restoreState = getRestoreState( rewindState, hasRequestedRestore );

	const render = () => {
		switch ( restoreState ) {
			case RestoreState.RestoreConfirm:
				return (
					<Confirm
						onConfirm={ onConfirm }
						restoreTimestamp={ restoreTimestamp }
						siteTitle={ siteTitle }
						restoreSettings={ restoreSettings }
						onRestoreSettingsChange={ setRestoreSettings }
					/>
				);
			case RestoreState.RestoreInProgress:
				return (
					<InProgress
						percent={ rewindState?.rewind?.progress ? rewindState?.rewind?.progress : 0 }
						siteId={ siteId }
					/>
				);
			case RestoreState.RestoreFinished:
				return <Finished siteId={ siteId } restoreId={ restoreId } />;
			case RestoreState.RestoreError:
				return <Error />;
		}
	};

	return (
		<Main className="restore">
			<DocumentHead title="Restore" />
			<SidebarNavigation />
			{ siteId && <QueryRewindRestoreStatus siteId={ siteId } /> }
			<Card>
				<div className="restore__header">
					<Gridicon icon="history" size={ 48 } />
				</div>
				{ render() }
			</Card>
		</Main>
	);
};

export default BackupRestorePage;
