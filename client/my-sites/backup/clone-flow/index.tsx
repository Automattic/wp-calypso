import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdvancedCredentials from 'calypso/components/advanced-credentials';
import DocumentHead from 'calypso/components/data/document-head';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import StepProgress from 'calypso/components/step-progress';
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { rewindRestore } from 'calypso/state/activity-log/actions';
import { setValidFrom } from 'calypso/state/jetpack-review-prompt/actions';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import { getInProgressBackupForSite } from 'calypso/state/rewind/selectors';
import getInProgressRewindStatus from 'calypso/state/selectors/get-in-progress-rewind-status';
import getRestoreProgress from 'calypso/state/selectors/get-restore-progress';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
	siteUrl: string;
}

const BackupCloneFlow: FunctionComponent< Props > = ( { siteUrl } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );

	const [ rewindConfig, setRewindConfig ] = useState< RewindConfig >( defaultRewindConfig );
	const [ userHasRequestedRestore, setUserHasRequestedRestore ] = useState< boolean >( false );
	const [ userHasSetDestination, setUserHasSetDestination ] = useState< boolean >( false );
	const [ userHasSetBackupPeriod, setUserHasSetBackupPeriod ] = useState< boolean >( false );
	const [ backupPeriod, setBackupPeriod ] = useState< string >( '' );
	//const [ destinationUrl, setDestinationUrl ] = useState< string >( '' );

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
	const backupCurrentlyInProgress = useSelector( ( state ) =>
		getInProgressBackupForSite( state, siteId )
	);

	const rewindState = useSelector( ( state ) => getRewindState( state, siteId ) ) as RewindState;
	const inProgressRewindStatus = useSelector( ( state ) =>
		getInProgressRewindStatus( state, siteId, backupPeriod )
	);
	const { message, percent, currentEntry, status } = useSelector(
		( state ) => getRestoreProgress( state, siteId ) || ( {} as RestoreProgress )
	);

	const requestRestore = useCallback(
		() => dispatch( rewindRestore( siteId, backupPeriod, rewindConfig ) ),
		[ dispatch, rewindConfig, backupPeriod, siteId ]
	);
	const onConfirm = useCallback( () => {
		dispatch( setValidFrom( 'restore', Date.now() ) );
		setUserHasRequestedRestore( true );
		requestRestore();
	}, [ dispatch, setUserHasRequestedRestore, requestRestore ] );

	const onSetDestination = useCallback( () => {
		// TODO: Validate credentials and if they work...
		setUserHasSetDestination( true );
	}, [ setUserHasSetDestination ] );

	const onSetBackupPeriod = useCallback(
		( period ) => {
			// Grab the selected backup period / rewindId and set it
			setBackupPeriod( period );
			setUserHasSetBackupPeriod( true );
		},
		[ setUserHasSetBackupPeriod, setBackupPeriod ]
	);

	const CredSettings = {
		action: 'unsubmitted',
		host: 'generic',
		role: 'alternate',
	};

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	const loading = rewindState.state === 'uninitialized';
	// TODO: Use when we're currently restoring
	// const { restoreId } = rewindState.rewind || {};

	const disableClone = false;

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
				/>
			</div>
			<Button className="clone-flow__primary-button" primary onClick={ onSetDestination }>
				{ translate( 'Go to Backup Select' ) }
			</Button>
			-- Temporary button for skipping this step to get to the next screen
		</>
	);

	// Screen that allows user to select a backup point to clone
	const renderSetBackupPeriod = () => (
		<>
			<StepProgress currentStep={ Step.ClonePoint } steps={ steps } />
			<h3 className="clone-flow__title">{ translate( 'Select a Backup Point to Clone' ) }</h3>
			<p className="clone-flow__info">
				{ translate( "Which point in your site's history would you like to clone from?" ) }
			</p>
			<Button
				className="clone-flow__primary-button"
				primary
				onClick={ () => onSetBackupPeriod( 12345 ) }
			>
				{ translate( 'Clone from this point' ) }
			</Button>
			<Button
				className="clone-flow__primary-button"
				secondary
				onClick={ () => onSetBackupPeriod( 67890 ) }
			>
				{ translate( 'Clone from here' ) }
			</Button>
		</>
	);

	// Screen that allows the user to configure which items to clone
	const renderConfirm = () => (
		<>
			<StepProgress currentStep={ Step.Configure } steps={ steps } />
			<h3 className="clone-flow__title">{ translate( 'Clone site' ) }</h3>
			<p className="clone-flow__info">
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
			<h4 className="clone-flow__cta">{ translate( 'Choose the items you wish to restore:' ) }</h4>
			<RewindConfigEditor currentConfig={ rewindConfig } onConfigChange={ setRewindConfig } />
			<RewindFlowNotice
				gridicon="notice"
				title={ translate(
					'Cloning will override and remove all content on the destination site.'
				) }
				type={ RewindFlowNoticeLevel.WARNING }
			/>
			<>
				{ backupCurrentlyInProgress && (
					<RewindFlowNotice
						gridicon="notice"
						title={ translate(
							'A backup is currently in progress; cloning now will stop the backup.'
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
					{ translate( 'Confirm clone' ) }
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
			<h3 className="clone-flow__title">{ translate( 'Currently cloning your site' ) }</h3>
			<ProgressBar
				isReady={ 'running' === status }
				initializationMessage={ translate( 'Initializing the clone process' ) }
				message={ message }
				entry={ currentEntry }
				percent={ percent }
			/>
			<p className="clone-flow__info">
				{ translate(
					'We are cloning your site back from the {{strong}}%(backupDisplayDate)s{{/strong}} backup.',
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
					"Don't want to wait? For your convenience, we'll email you when your site has been fully cloned."
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
				{ translate( 'Your site has been successfully cloned.' ) }
			</h3>
			<p className="clone-flow__info">
				{ translate(
					'All of your selected items are now cloned from the {{strong}}%(backupDisplayDate)s{{/strong}} backup.',
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
			<Button primary href={ destinationUrl } className="clone-flow__primary-button">
				{ translate( 'View your website' ) }
			</Button>
		</>
	);

	const renderError = () => (
		<Error
			errorText={ translate( 'Clone failed: %s', {
				args: [ backupDisplayDate ],
				comment: '%s is a time/date string',
			} ) }
			siteUrl={ siteUrl }
		>
			<p className="clone-flow__info">
				{ translate(
					'An error occurred while restoring your site. Please {{button}}try your clone again{{/button}} or contact our support team to resolve the issue.',
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
				<DocumentHead title={ translate( 'Clone site' ) } />
				{ isJetpackCloud() && <SidebarNavigation /> }
				<div className="clone-flow__content">
					<QueryRewindBackups siteId={ siteId } />
					<QueryRewindState siteId={ siteId } />
					{ render() }
				</div>
			</Main>
		</>
	);
};

export default BackupCloneFlow;
