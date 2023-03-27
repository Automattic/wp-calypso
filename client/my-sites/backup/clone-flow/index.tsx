import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ActivityCardList from 'calypso/components/activity-card-list';
import AdvancedCredentials from 'calypso/components/advanced-credentials';
import DocumentHead from 'calypso/components/data/document-head';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import QueryRewindRestoreStatus from 'calypso/components/data/query-rewind-restore-status';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import StepProgress from 'calypso/components/step-progress';
import useRewindableActivityLogQuery from 'calypso/data/activity-log/use-rewindable-activity-log-query';
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { rewindClone } from 'calypso/state/activity-log/actions';
import { setValidFrom } from 'calypso/state/jetpack-review-prompt/actions';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import { getInProgressBackupForSite } from 'calypso/state/rewind/selectors';
import getInProgressRewindStatus from 'calypso/state/selectors/get-in-progress-rewind-status';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import getRestoreProgress from 'calypso/state/selectors/get-restore-progress';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import { backupMainPath } from '../paths';
import Error from '../rewind-flow/error';
import Loading from '../rewind-flow/loading';
import ProgressBar from '../rewind-flow/progress-bar';
import RewindConfigEditor from '../rewind-flow/rewind-config-editor';
import RewindFlowNotice, { RewindFlowNoticeLevel } from '../rewind-flow/rewind-flow-notice';
import CheckYourEmail from '../rewind-flow/rewind-flow-notice/check-your-email';
import { defaultRewindConfig, RewindConfig } from '../rewind-flow/types';
import type { ClickHandler } from 'calypso/components/step-progress';
import type { RestoreProgress } from 'calypso/state/data-layer/wpcom/activity-log/rewind/restore-status/type';
import type { RewindState } from 'calypso/state/data-layer/wpcom/sites/rewind/type';
import './style.scss';

enum Step {
	Destination = 0,
	ClonePoint = 1,
	Configure = 2,
}

interface Props {
	siteId: number;
}

const BackupCloneFlow: FunctionComponent< Props > = ( { siteId } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const moment = useLocalizedMoment();
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const siteUrl = useSelector( ( state ) => ( siteId && getSiteUrl( state, siteId ) ) || '' );
	const previousPath = useSelector( ( state ) => getPreviousRoute( state ) );

	const [ rewindConfig, setRewindConfig ] = useState< RewindConfig >( defaultRewindConfig );
	const [ userHasRequestedRestore, setUserHasRequestedRestore ] = useState< boolean >( false );
	const [ userHasSetDestination, setUserHasSetDestination ] = useState< boolean >( false );
	const [ cloneDestination, setCloneDestination ] = useState< string >( '' );
	const [ userHasSetBackupPeriod, setUserHasSetBackupPeriod ] = useState< boolean >( false );
	const [ backupPeriod, setBackupPeriod ] = useState< string >( '' );
	const [ backupDisplayDate, setBackupDisplayDate ] = useState< string >( '' );

	const steps = [
		{
			message: translate( 'Set destination' ),
			onClick: () => setUserHasSetDestination( false ),
			show: 'onComplete',
		} as ClickHandler,
		translate( 'Select clone point' ),
		translate( 'Configure' ),
	];

	const refreshBackups = useCallback(
		() => dispatch( requestRewindBackups( siteId ) ),
		[ dispatch, siteId ]
	);
	const backupCurrentlyInProgress = useSelector( ( state ) => {
		if ( ! siteId ) {
			return null;
		}
		return getInProgressBackupForSite( state, siteId );
	} );

	const rewindState = useSelector( ( state ) => getRewindState( state, siteId ) ) as RewindState;
	const inProgressRewindStatus = useSelector( ( state ) => {
		return getInProgressRewindStatus( state, siteId, backupPeriod );
	} );
	const { message, percent, currentEntry, status } = useSelector( ( state ) => {
		return getRestoreProgress( state, siteId ) || ( {} as RestoreProgress );
	} );

	const CredSettings = {
		action: 'edit',
		host: 'generic',
		role: 'alternate',
	};

	const requestClone = useCallback(
		() =>
			dispatch(
				rewindClone( siteId, backupPeriod, { types: rewindConfig, roleName: CredSettings.role } )
			),
		[ dispatch, siteId, backupPeriod, rewindConfig, CredSettings.role ]
	);
	const onConfirm = useCallback( () => {
		dispatch( setValidFrom( 'restore', Date.now() ) );
		setUserHasRequestedRestore( true );
		requestClone();
	}, [ dispatch, setUserHasRequestedRestore, requestClone ] );

	// Takes a destination as a vault role or blog id
	const onSetDestination = useCallback(
		( destination: string ) => {
			// TODO: At the moment this is just 'alternate'
			// but we should also save the URL for alternate creds as we'll use it in the confirm
			// screen and also the View Website link after Clone
			setCloneDestination( destination );
			setUserHasSetDestination( true );
		},
		[ setUserHasSetDestination, setCloneDestination ]
	);

	const onSetBackupPeriod = useCallback(
		( period ) => {
			// Grab the selected backup period / rewindId and set it
			setBackupPeriod( period );
			setUserHasSetBackupPeriod( true );
			const displayDate = applySiteOffset( moment( parseFloat( period ) * 1000 ), {
				gmtOffset,
				timezone,
			} ).format( 'LLL' );
			setBackupDisplayDate( displayDate );
		},
		[ moment, gmtOffset, timezone ]
	);

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	const loading = rewindState.state === 'uninitialized';
	const { restoreId } = rewindState.rewind || {};

	const disableClone = false;

	const { data: logs } = useRewindableActivityLogQuery( siteId, {}, { enabled: !! siteId } );

	// Screen that allows user to add credentials for an alternate restore / clone
	const renderSetDestination = () => (
		<>
			<StepProgress currentStep={ Step.Destination } steps={ steps } />
			<h3 className="clone-flow__title">{ translate( 'Set a destination site' ) }</h3>
			<p className="clone-flow__info">
				{ translate( 'Input information about the site you want to clone to' ) }
			</p>
			<div className="clone-flow__advanced-credentials">
				<AdvancedCredentials
					action={ CredSettings.action }
					host={ CredSettings.host }
					role={ CredSettings.role }
					onFinishCallback={ () => onSetDestination( CredSettings.role ) }
					redirectOnFinish={ false }
					goBackPath={ previousPath }
				/>
			</div>
		</>
	);

	// Screen that allows user to select a backup point to clone
	const renderSetBackupPeriod = () => (
		<>
			<StepProgress currentStep={ Step.ClonePoint } steps={ steps } />
			<h3 className="clone-flow__title">{ translate( 'Select a Backup Point to Copy' ) }</h3>
			<p className="clone-flow__info">
				{ translate( "Which point in your site's history would you like to copy from?" ) }
			</p>
			<div className="activity-log-v2__content">
				<ActivityCardList
					logs={ logs }
					pageSize={ 10 }
					showFilter={ false }
					availableActions={ [ 'clone' ] }
					onClickClone={ onSetBackupPeriod }
				/>
			</div>
		</>
	);

	// Screen that allows the user to configure which items to clone
	const renderConfirm = () => (
		<>
			<StepProgress currentStep={ Step.Configure } steps={ steps } />
			<h3 className="clone-flow__title">{ translate( 'Copy site' ) }</h3>
			<p className="clone-flow__info">
				{ translate(
					'{{strong}}%(backupDisplayDate)s{{/strong}} is the selected point for your copy.',
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
			<p className="clone-flow__info">
				{ translate( '{{strong}}%(destinationUrl)s{{/strong}} is URL you are copying to.', {
					args: {
						destinationUrl: cloneDestination,
					},
					components: {
						strong: <strong />,
					},
				} ) }
			</p>
			<h4 className="clone-flow__cta">{ translate( 'Choose the items you wish to restore:' ) }</h4>
			<RewindConfigEditor currentConfig={ rewindConfig } onConfigChange={ setRewindConfig } />
			<RewindFlowNotice
				gridicon="notice"
				title={ translate(
					'Copying will override and remove all content on the destination site.'
				) }
				type={ RewindFlowNoticeLevel.WARNING }
			/>
			<>
				{ backupCurrentlyInProgress && (
					<RewindFlowNotice
						gridicon="notice"
						title={ translate(
							'A backup is currently in progress; copying now will stop the backup.'
						) }
						type={ RewindFlowNoticeLevel.WARNING }
					/>
				) }
			</>
			<div className="clone-flow__btn-group">
				<Button className="clone-flow__back-button" href={ backupMainPath( siteSlug ) }>
					{ translate( 'Go back' ) }
				</Button>
				<Button
					className="clone-flow__primary-button"
					primary
					onClick={ onConfirm }
					disabled={ disableClone }
				>
					{ translate( 'Confirm configuration' ) }
				</Button>
			</div>
			<Interval onTick={ refreshBackups } period={ EVERY_FIVE_SECONDS } />
		</>
	);

	const renderInProgress = () => (
		<>
			<div className="clone-flow__header">
				<Gridicon icon="history" size={ 48 } />
			</div>
			<h3 className="clone-flow__title">{ translate( 'Currently copying your site' ) }</h3>
			<ProgressBar
				isReady={ 'running' === status }
				initializationMessage={ translate( 'Initializing the copy process' ) }
				message={ message }
				entry={ currentEntry }
				percent={ percent }
			/>
			<p className="clone-flow__info">
				{ translate(
					'We are copying your site back from the {{strong}}%(backupDisplayDate)s{{/strong}} backup.',
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
					"Don't want to wait? For your convenience, we'll email you when your site has been fully copied."
				) }
			/>
		</>
	);

	const renderFinished = () => (
		<>
			<div className="clone-flow__header">
				<img
					src="/calypso/images/illustrations/jetpack-restore-success.svg"
					alt="jetpack cloud restore success"
				/>
			</div>
			<h3 className="clone-flow__title">
				{ translate( 'Your site has been successfully copied.' ) }
			</h3>
			<p className="clone-flow__info">
				{ translate(
					'All of your selected items are now copied from the {{strong}}%(backupDisplayDate)s{{/strong}} backup.',
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
			<Button primary href={ cloneDestination } className="clone-flow__primary-button">
				{ translate( 'View your website' ) }
			</Button>
		</>
	);

	const renderError = () => (
		<Error
			errorText={ translate( 'Copy failed: %s', {
				args: [ backupDisplayDate ],
				comment: '%s is a time/date string',
			} ) }
			siteUrl={ siteUrl }
		>
			<p className="clone-flow__info">
				{ translate(
					'An error occurred while restoring your site. Please {{button}}try your copy again{{/button}} or contact our support team to resolve the issue.',
					{
						components: {
							button: <Button className="clone-flow__error-retry-button" onClick={ onConfirm } />,
						},
					}
				) }
			</p>
		</Error>
	);

	// A clone is in progress if there's a restore currently happening and the target is something external
	// TODO: Check if there's an alternate restore in progress
	// We may also just need to check for a regular restore and display something
	const isInProgress =
		( ! inProgressRewindStatus && userHasRequestedRestore && userHasSetDestination ) ||
		( inProgressRewindStatus && [ 'queued', 'running' ].includes( inProgressRewindStatus ) );
	const isFinished = inProgressRewindStatus !== null && inProgressRewindStatus === 'finished';

	const render = () => {
		if ( loading ) {
			return <Loading />;
		} else if ( ! userHasSetDestination ) {
			return renderSetDestination();
		} else if ( ! userHasSetBackupPeriod ) {
			return renderSetBackupPeriod();
		} else if ( ! userHasRequestedRestore ) {
			return renderConfirm();
		} else if ( isInProgress ) {
			return renderInProgress();
		} else if ( isFinished ) {
			return renderFinished();
		}
		return renderError();
	};

	return (
		<>
			<Main className="clone-flow">
				<DocumentHead title={ translate( 'Copy site' ) } />
				{ isJetpackCloud() && <SidebarNavigation /> }
				<div className="clone-flow__content">
					<QueryRewindBackups siteId={ siteId } />
					<QueryRewindState siteId={ siteId } />
					{ restoreId && 'running' === inProgressRewindStatus && (
						<QueryRewindRestoreStatus siteId={ siteId } restoreId={ restoreId } />
					) }
					{ render() }
				</div>
			</Main>
		</>
	);
};

export default BackupCloneFlow;
