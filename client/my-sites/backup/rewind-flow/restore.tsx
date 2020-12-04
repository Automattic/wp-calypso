/**
 * External dependencies
 */
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent, useCallback, useState } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { defaultRewindConfig, RewindConfig } from './types';
import { rewindRestore } from 'calypso/state/activity-log/actions';
import CheckYourEmail from './rewind-flow-notice/check-your-email';
import Error from './error';
import getInProgressRewindStatus from 'calypso/state/selectors/get-in-progress-rewind-status';
import getRestoreProgress from 'calypso/state/selectors/get-restore-progress';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import Gridicon from 'calypso/components/gridicon';
import Loading from './loading';
import ProgressBar from './progress-bar';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import QueryRewindRestoreStatus from 'calypso/components/data/query-rewind-restore-status';
import RewindConfigEditor from './rewind-config-editor';
import RewindFlowNotice, { RewindFlowNoticeLevel } from './rewind-flow-notice';

/**
 * Type dependencies
 */
import type { RewindState } from 'calypso/state/data-layer/wpcom/sites/rewind/type';
import type { RestoreProgress } from 'calypso/state/data-layer/wpcom/activity-log/rewind/restore-status/type';

interface Props {
	backupDisplayDate: string;
	rewindId: string;
	siteId: number;
	siteUrl: string;
}

const BackupRestoreFlow: FunctionComponent< Props > = ( {
	backupDisplayDate,
	rewindId,
	siteId,
	siteUrl,
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ rewindConfig, setRewindConfig ] = useState< RewindConfig >( defaultRewindConfig );
	const [ userHasRequestedRestore, setUserHasRequestedRestore ] = useState< boolean >( false );

	const rewindState = useSelector( ( state ) => getRewindState( state, siteId ) ) as RewindState;
	const inProgressRewindStatus = useSelector( ( state ) =>
		getInProgressRewindStatus( state, siteId, rewindId )
	);
	const { message, percent, currentEntry, status } = useSelector(
		( state ) => getRestoreProgress( state, siteId ) || ( {} as RestoreProgress )
	);

	const requestRestore = useCallback(
		() => dispatch( rewindRestore( siteId, rewindId, rewindConfig ) ),
		[ dispatch, rewindConfig, rewindId, siteId ]
	);
	const onConfirm = useCallback( () => {
		setUserHasRequestedRestore( true );
		requestRestore();
	}, [ setUserHasRequestedRestore, requestRestore ] );

	const loading = rewindState.state === 'uninitialized';
	const { restoreId } = rewindState.rewind || {};

	const renderConfirm = () => (
		<>
			<div className="rewind-flow__header">
				<Gridicon icon="history" size={ 48 } />
			</div>
			<h3 className="rewind-flow__title">{ translate( 'Restore site' ) }</h3>
			<p className="rewind-flow__info">
				{ translate(
					'{{strong}}%(backupDisplayDate)s{{/strong}} is the selected point for your restore. ',
					{
						args: {
							backupDisplayDate,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<h4 className="rewind-flow__cta">{ translate( 'Choose the items you wish to restore:' ) }</h4>
			<RewindConfigEditor currentConfig={ rewindConfig } onConfigChange={ setRewindConfig } />
			<RewindFlowNotice
				gridicon="notice"
				title={ translate( 'This will override and remove all content after this point' ) }
				type={ RewindFlowNoticeLevel.WARNING }
			/>
			<Button
				className="rewind-flow__primary-button"
				primary
				onClick={ onConfirm }
				disabled={ Object.values( rewindConfig ).every( ( setting ) => ! setting ) }
			>
				{ translate( 'Confirm restore' ) }
			</Button>
		</>
	);

	const renderInProgress = () => (
		<>
			<div className="rewind-flow__header">
				<Gridicon icon="history" size={ 48 } />
			</div>
			<h3 className="rewind-flow__title">{ translate( 'Currently restoring your site' ) }</h3>
			<ProgressBar
				isReady={ 'running' === status }
				message={ message }
				entry={ currentEntry }
				percent={ percent }
			/>
			<p className="rewind-flow__info">
				{ translate(
					'We are restoring your site back to {{strong}}%(backupDisplayDate)s{{/strong}}.',
					{
						args: {
							backupDisplayDate,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<CheckYourEmail
				message={ translate(
					"Don't want to wait? For your convenience, we'll email you when your site has been fully restored."
				) }
			/>
		</>
	);

	const renderFinished = () => (
		<>
			<div className="rewind-flow__header">
				<img
					src="/calypso/images/illustrations/jetpack-restore-success.svg"
					alt="jetpack cloud restore success"
				/>
			</div>
			<h3 className="rewind-flow__title">
				{ translate( 'Your site has been successfully restored.' ) }
			</h3>
			<p className="rewind-flow__info">
				{ translate(
					'All of your selected items are now restored back to {{strong}}%(backupDisplayDate)s{{/strong}}.',
					{
						args: {
							backupDisplayDate,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<Button primary href={ siteUrl } className="rewind-flow__primary-button">
				{ translate( 'View your website' ) }
			</Button>
		</>
	);

	const renderError = () => (
		<Error
			errorText={ translate( 'Restore failed: %s', {
				args: [ backupDisplayDate ],
				comment: '%s is a time/date string',
			} ) }
			siteUrl={ siteUrl }
		>
			<p className="rewind-flow__info">
				{ translate(
					'An error occurred while restoring your site. Please {{button}}try your restore again{{/button}} or contact our support team to resolve the issue.',
					{
						components: {
							button: <Button className="rewind-flow__error-retry-button" onClick={ onConfirm } />,
						},
					}
				) }
			</p>
		</Error>
	);

	const render = () => {
		if ( loading ) {
			return <Loading />;
		} else if ( ! inProgressRewindStatus && ! userHasRequestedRestore ) {
			return renderConfirm();
		} else if (
			( ! inProgressRewindStatus && userHasRequestedRestore ) ||
			( inProgressRewindStatus && [ 'queued', 'running' ].includes( inProgressRewindStatus ) )
		) {
			return renderInProgress();
		} else if ( inProgressRewindStatus !== null && inProgressRewindStatus === 'finished' ) {
			return renderFinished();
		}
		return renderError();
	};

	return (
		<>
			<QueryRewindState siteId={ siteId } />
			{ restoreId && 'running' === inProgressRewindStatus && (
				<QueryRewindRestoreStatus siteId={ siteId } restoreId={ restoreId } />
			) }
			{ render() }
		</>
	);
};

export default BackupRestoreFlow;
