import config from '@automattic/calypso-config';
import { Button, Card, Gridicon } from '@automattic/components';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useState } from 'react';
import JetpackReviewPrompt from 'calypso/blocks/jetpack-review-prompt';
import QueryJetpackCredentialsStatus from 'calypso/components/data/query-jetpack-credentials-status';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import QueryRewindRestoreStatus from 'calypso/components/data/query-rewind-restore-status';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import { backupPath } from 'calypso/lib/jetpack/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { rewindRestore } from 'calypso/state/activity-log/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import {
	areJetpackCredentialsInvalid,
	hasJetpackCredentials,
} from 'calypso/state/jetpack/credentials/selectors';
import { setValidFrom } from 'calypso/state/jetpack-review-prompt/actions';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import {
	usePreflightStatusQuery,
	useEnqueuePreflightCheck,
} from 'calypso/state/rewind/preflight/hooks';
import { getPreflightStatus } from 'calypso/state/rewind/preflight/selectors';
import { PreflightTestStatus } from 'calypso/state/rewind/preflight/types';
import { getInProgressBackupForSite } from 'calypso/state/rewind/selectors';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import getInProgressRewindStatus from 'calypso/state/selectors/get-in-progress-rewind-status';
import getIsRestoreInProgress from 'calypso/state/selectors/get-is-restore-in-progress';
import getRestoreProgress from 'calypso/state/selectors/get-restore-progress';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { backupMainPath } from '../paths';
import Error from './error';
import Loading from './loading';
import ProgressBar from './progress-bar';
import RewindConfigEditor from './rewind-config-editor';
import RewindFlowNotice, { RewindFlowNoticeLevel } from './rewind-flow-notice';
import CheckYourEmail from './rewind-flow-notice/check-your-email';
import MissingCredentials from './steps/missing-credentials';
import { defaultRewindConfig, RewindConfig } from './types';
import type { RestoreProgress } from 'calypso/state/data-layer/wpcom/activity-log/rewind/restore-status/type';
import type { RewindState } from 'calypso/state/data-layer/wpcom/sites/rewind/type';

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

	const refreshBackups = useCallback(
		() => dispatch( requestRewindBackups( siteId ) ),
		[ dispatch, siteId ]
	);
	const backupCurrentlyInProgress = useSelector( ( state ) =>
		getInProgressBackupForSite( state, siteId )
	);

	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );

	const areCredentialsInvalid = useSelector( ( state ) =>
		areJetpackCredentialsInvalid( state, siteId, 'main' )
	);

	const [ userHasRequestedRestore, setUserHasRequestedRestore ] = useState< boolean >( false );
	const [ restoreInitiated, setRestoreInitiated ] = useState( false );

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

	const preflightStatus = useSelector( ( state ) => getPreflightStatus( state, siteId ) );
	const hasCredentials = useSelector( ( state ) => hasJetpackCredentials( state, siteId ) );
	const credentialsAreValid = hasCredentials && ! areCredentialsInvalid;
	const isRestoreInProgress = useSelector( ( state ) => getIsRestoreInProgress( state, siteId ) );
	const needCredentials = useSelector( ( state ) => getDoesRewindNeedCredentials( state, siteId ) );
	const isPreflightEnabled = config.isEnabled( 'jetpack/backup-restore-preflight-checks' );
	const { refetch: refetchPreflightStatus } = usePreflightStatusQuery(
		siteId,
		// Only enable the preflight check if the user has requested a restore and we don't need credentials.
		userHasRequestedRestore && ! needCredentials
	);
	const preflightCheck = useEnqueuePreflightCheck( siteId );

	useEffect( () => {
		const preflightPassed = isPreflightEnabled && preflightStatus === PreflightTestStatus.SUCCESS;

		if ( userHasRequestedRestore && ! isRestoreInProgress && ! restoreInitiated ) {
			if ( credentialsAreValid || preflightPassed ) {
				dispatch( setValidFrom( 'restore', Date.now() ) );
				requestRestore();
				setRestoreInitiated( true );
			}
		}
	}, [
		credentialsAreValid,
		dispatch,
		isPreflightEnabled,
		isRestoreInProgress,
		preflightStatus,
		requestRestore,
		restoreInitiated,
		userHasRequestedRestore,
	] );
	const onConfirm = useCallback( () => {
		// Queue preflight
		if ( isPreflightEnabled && ! credentialsAreValid ) {
			preflightCheck.mutate(
				{ siteId },
				{
					onSuccess: () => {
						refetchPreflightStatus();
					},
				}
			);
		}

		// Mark that the user has requested a restore
		setUserHasRequestedRestore( true );

		// Track the restore confirmation event.
		dispatch( recordTracksEvent( 'calypso_jetpack_backup_restore_confirm' ) );
	}, [
		isPreflightEnabled,
		credentialsAreValid,
		dispatch,
		preflightCheck,
		siteId,
		refetchPreflightStatus,
	] );

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	const loading = rewindState.state === 'uninitialized';
	const { restoreId } = rewindState.rewind || {};

	const disableRestore =
		( ! isAtomic && areCredentialsInvalid ) ||
		Object.values( rewindConfig ).every( ( setting ) => ! setting );

	const renderConfirm = () => (
		<>
			{ ! isAtomic && <QueryJetpackCredentialsStatus siteId={ siteId } role="main" /> }
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
				title={ translate( 'Restoring will override and remove all content after this point.' ) }
				type={ RewindFlowNoticeLevel.WARNING }
			/>
			<>
				{ backupCurrentlyInProgress && (
					<RewindFlowNotice
						gridicon="notice"
						title={ translate(
							'A backup is currently in progress; restoring now will stop the backup.'
						) }
						type={ RewindFlowNoticeLevel.WARNING }
					/>
				) }
			</>
			<div className="rewind-flow__btn-group">
				<Button className="rewind-flow__back-button" href={ backupMainPath( siteSlug ) }>
					{ translate( 'Go back' ) }
				</Button>
				<Button
					className="rewind-flow__primary-button"
					primary
					onClick={ onConfirm }
					disabled={ disableRestore }
				>
					{ translate( 'Confirm restore' ) }
				</Button>
			</div>
			<Interval onTick={ refreshBackups } period={ EVERY_FIVE_SECONDS } />
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
				initializationMessage={ translate( 'Initializing the restore process' ) }
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

	const isInProgress =
		( ! inProgressRewindStatus && userHasRequestedRestore ) ||
		( inProgressRewindStatus && [ 'queued', 'running' ].includes( inProgressRewindStatus ) );
	const isFinished = inProgressRewindStatus !== null && inProgressRewindStatus === 'finished';

	useEffect( () => {
		if ( isFinished ) {
			setRestoreInitiated( false );
			setUserHasRequestedRestore( false );
		}
	}, [ isFinished ] );

	const render = () => {
		if ( loading ) {
			return <Loading />;
		} else if ( ! inProgressRewindStatus && ! userHasRequestedRestore ) {
			return renderConfirm();
		} else if ( ! inProgressRewindStatus && needCredentials ) {
			return (
				<MissingCredentials
					siteSlug={ siteSlug }
					enterCredentialsEventName="calypso_jetpack_backup_restore_missing_credentials_cta"
					goBackEventName="calypso_jetpack_backup_restore_missing_credentials_back"
					goBackUrl={ backupPath( siteSlug ) }
				/>
			);
		} else if ( isInProgress ) {
			return renderInProgress();
		} else if ( isFinished ) {
			return renderFinished();
		}
		return renderError();
	};

	return (
		<>
			<QueryRewindBackups siteId={ siteId } />
			<QueryRewindState siteId={ siteId } />
			{ restoreId && 'running' === inProgressRewindStatus && (
				<QueryRewindRestoreStatus siteId={ siteId } restoreId={ restoreId } />
			) }
			<Card>{ render() }</Card>
			{ ( isInProgress || isFinished ) && <JetpackReviewPrompt align="center" type="restore" /> }
		</>
	);
};

export default BackupRestoreFlow;
