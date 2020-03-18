/**
 * External dependencies
 */
import React, { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import {
	defaultRewindConfig,
	RewindConfig,
} from 'landing/jetpack-cloud/components/rewind-config/types';
import { getSelectedSiteId } from 'state/ui/selectors';
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

const BackupRestorePage: FunctionComponent< Props > = ( { restoreId } ) => {
	const dispatch = useDispatch();

	const [ restoreSettings, setRestoreSettings ] = useState< RewindConfig >( defaultRewindConfig );

	const siteId = useSelector( getSelectedSiteId );
	const rewindState = useSelector< object, RewindState >( state =>
		getRewindState( state, siteId )
	);
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

	const render = () => {
		if ( ! rewindState?.rewind && ! hasRequestedRestore ) {
			return (
				<Confirm
					onConfirm={ onConfirm }
					restoreTimestamp={ restoreTimestamp }
					siteTitle={ siteTitle }
					restoreSettings={ restoreSettings }
					onRestoreSettingsChange={ setRestoreSettings }
				/>
			);
		} else if (
			( ! rewindState?.rewind && hasRequestedRestore ) ||
			[ 'queued', 'running' ].includes( rewindState?.rewind?.status )
		) {
			return (
				<InProgress
					percent={ rewindState?.rewind?.progress ? rewindState?.rewind?.progress : 0 }
					siteId={ siteId }
				/>
			);
		} else if ( rewindState?.rewind?.status === 'finished' ) {
			return <Finished siteId={ siteId } restoreId={ restoreId } />;
		}
		return <Error />;
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
