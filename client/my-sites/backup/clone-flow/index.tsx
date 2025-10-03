import { Button, Card, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import ActivityCardList from 'calypso/components/activity-card-list';
import AdvancedCredentials from 'calypso/components/advanced-credentials';
import DocumentHead from 'calypso/components/data/document-head';
import QueryBackupStagingSitesList from 'calypso/components/data/query-backup-staging-sites-list';
import QueryRewindBackups from 'calypso/components/data/query-rewind-backups';
import QueryRewindRestoreStatus from 'calypso/components/data/query-rewind-restore-status';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import BackupSuccessful from 'calypso/components/jetpack/daily-backup-status/status-card/backup-successful';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import useRewindableActivityLogQuery from 'calypso/data/activity-log/use-rewindable-activity-log-query';
import accept from 'calypso/lib/accept';
import { Interval, EVERY_FIVE_SECONDS } from 'calypso/lib/interval';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import { useDispatch, useSelector } from 'calypso/state';
import { JETPACK_CREDENTIALS_UPDATE_RESET } from 'calypso/state/action-types';
import { rewindClone, rewindStagingClone } from 'calypso/state/activity-log/actions';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { setValidFrom } from 'calypso/state/jetpack-review-prompt/actions';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';
import { getInProgressBackupForSite } from 'calypso/state/rewind/selectors';
import getBackupStagingSites from 'calypso/state/rewind/selectors/get-backup-staging-sites';
import hasFetchedStagingSitesList from 'calypso/state/rewind/selectors/has-fetched-staging-sites-list';
import isFetchingStagingSitesList from 'calypso/state/rewind/selectors/is-fetching-staging-sites-list';
import getJetpackCredentials from 'calypso/state/selectors/get-jetpack-credentials';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import getRestoreProgress from 'calypso/state/selectors/get-restore-progress';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import getSiteUrl from 'calypso/state/sites/selectors/get-site-url';
import Error from '../rewind-flow/error';
import Loading from '../rewind-flow/loading';
import ProgressBar from '../rewind-flow/progress-bar';
import RewindConfigEditor from '../rewind-flow/rewind-config-editor';
import RewindFlowNotice, { RewindFlowNoticeLevel } from '../rewind-flow/rewind-flow-notice';
import { defaultRewindConfig, RewindConfig } from '../rewind-flow/types';
import CloneFlowStepProgress from './step-progress';
import CloneFlowSuggestionSearch from './suggestion-search';
import type { UseQueryResult } from '@tanstack/react-query';
import type { RestoreProgress } from 'calypso/state/data-layer/wpcom/activity-log/rewind/restore-status/type';
import type { RewindState } from 'calypso/state/data-layer/wpcom/sites/rewind/type';
import './style.scss';

interface Props {
	siteId: number;
}

type ActivityLogEntry = {
	activityDate: string;
};

const BackupCloneFlow: FunctionComponent< Props > = ( { siteId } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const moment = useLocalizedMoment();
	const gmtOffset = useSelector( ( state ) => getSiteGmtOffset( state, siteId ) );
	const timezone = useSelector( ( state ) => getSiteTimezoneValue( state, siteId ) );
	const siteUrl = useSelector( ( state ) => ( siteId && getSiteUrl( state, siteId ) ) || '' );
	const previousPath = useSelector( getPreviousRoute );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	const [ rewindConfig, setRewindConfig ] = useState< RewindConfig >( defaultRewindConfig );
	const [ userHasRequestedRestore, setUserHasRequestedRestore ] = useState< boolean >( false );
	const [ userHasSetDestination, setUserHasSetDestination ] = useState< boolean >( false );
	const [ cloneDestination, setCloneDestination ] = useState< string >( '' );
	const [ isCloneToStaging, setIsCloneToStaging ] = useState< boolean >( false );
	const [ userHasSetBackupPeriod, setUserHasSetBackupPeriod ] = useState< boolean >( false );
	const [ backupPeriod, setBackupPeriod ] = useState< string >( '' );
	const [ backupDisplayDate, setBackupDisplayDate ] = useState< string >( '' );
	const [ showCredentialForm, setShowCredentialForm ] = useState< boolean >( false );
	const [ restoreId, setRestoreId ] = useState< number | null >( null );

	const activityLogPath = '/activity-log/' + siteSlug;
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

	// This is the ID which will perform the restore.
	// For clone restores, it will be the site ID.
	// For staging restores, it will be the staging/destination site ID.
	const restoreSiteId = isCloneToStaging ? Number( cloneDestination ) : siteId;

	const rewindState = useSelector( ( state ) => {
		return getRewindState( state, siteId );
	} ) as RewindState;

	const stagingSiteRewindState = useSelector( ( state ) => {
		return getRewindState( state, cloneDestination );
	} ) as RewindState;

	const cloneRoleCredentials = useSelector( ( state ) => {
		return getJetpackCredentials( state, siteId, cloneDestination );
	} );

	useEffect( () => {
		// Here we are updating the restoreId any time the user requests a new restore and only if the restoreId
		// has changed to avoid unnecessary re-renders.
		// This is necessary because the restoreId is used to query the restore progress in the
		// QueryRewindRestoreStatus component.
		if ( userHasRequestedRestore ) {
			if ( isCloneToStaging && stagingSiteRewindState.rewind?.restoreId ) {
				const newRestoreId = stagingSiteRewindState.rewind.restoreId;
				if ( restoreId !== newRestoreId ) {
					setRestoreId( newRestoreId );
				}
			} else if ( ! isCloneToStaging && rewindState.rewind?.restoreId ) {
				const newRestoreId = rewindState.rewind.restoreId;
				if ( restoreId !== newRestoreId ) {
					setRestoreId( newRestoreId );
				}
			}
		}
	}, [
		isCloneToStaging,
		rewindState,
		stagingSiteRewindState,
		restoreId,
		userHasRequestedRestore,
	] );

	const getUrlFromCreds = () => {
		if ( ! cloneRoleCredentials ) {
			return '';
		}
		if ( cloneRoleCredentials.baseUrl ) {
			return cloneRoleCredentials.baseUrl;
		}
		if ( cloneRoleCredentials.site_url ) {
			return cloneRoleCredentials.site_url;
		}
		return '';
	};

	const {
		message,
		percent,
		currentEntry,
		status: inProgressRewindStatus,
	} = useSelector( ( state ) => {
		return getRestoreProgress( state, restoreSiteId ) || ( {} as RestoreProgress );
	} );

	const CredSettings = {
		action: 'edit',
		host: 'generic',
		role: 'alternate',
	};

	const stagingSites = useSelector( ( state ) => getBackupStagingSites( state, siteId ) );
	const isRequestingStagingList = useSelector( ( state ) =>
		isFetchingStagingSitesList( state, siteId )
	);
	const hasFetchedStagingList = useSelector( ( state ) =>
		hasFetchedStagingSitesList( state, siteId )
	);

	const isLoadingStagingSites = isRequestingStagingList && ! hasFetchedStagingList;

	const getDestinationUrl = () => {
		if ( isCloneToStaging || cloneDestination.startsWith( 'staging-' ) ) {
			return (
				stagingSites.find(
					( site ) =>
						site.blog_id.toString() === cloneDestination ||
						site.role?.toString() === cloneDestination
				)?.siteurl || ''
			);
		}

		return getUrlFromCreds();
	};

	function onAddNewClick() {
		setShowCredentialForm( true );
		setIsCloneToStaging( false );
		dispatch( recordTracksEvent( 'calypso_jetpack_clone_flow_set_new_destination' ) );
		dispatch( { type: JETPACK_CREDENTIALS_UPDATE_RESET, siteId } );
	}

	function onSearchChange( newValue: string, isNavigating: boolean ) {
		if ( true === isNavigating ) {
			const selectedSite = stagingSites.find( ( site ) => site.siteurl === newValue );
			if ( selectedSite ) {
				if ( selectedSite.role?.startsWith( 'staging-' ) ) {
					setCloneDestination( selectedSite.role );
					setUserHasSetDestination( true );
					setIsCloneToStaging( false );
					dispatch( recordTracksEvent( 'calypso_jetpack_clone_flow_set_staging_site_with_role' ) );
				} else {
					setCloneDestination( selectedSite.blog_id.toString() );
					setUserHasSetDestination( true );
					setIsCloneToStaging( true );
					dispatch( recordTracksEvent( 'calypso_jetpack_clone_flow_set_staging_site' ) );
				}
			}
		}
	}

	const requestClone = useCallback( () => {
		if ( isCloneToStaging ) {
			// If we're cloning to staging, we should use a new staging action
			return dispatch(
				rewindStagingClone( siteId, backupPeriod, { types: rewindConfig }, cloneDestination )
			);
		}

		return dispatch(
			rewindClone( siteId, backupPeriod, {
				types: rewindConfig,
				roleName: cloneDestination || CredSettings.role,
			} )
		);
	}, [
		isCloneToStaging,
		dispatch,
		siteId,
		backupPeriod,
		rewindConfig,
		CredSettings.role,
		cloneDestination,
	] );

	const onConfirm = useCallback( () => {
		dispatch( setValidFrom( 'restore', Date.now() ) );
		setUserHasRequestedRestore( true );
		requestClone();
		dispatch( recordTracksEvent( 'calypso_jetpack_clone_flow_confirm' ) );
	}, [ dispatch, setUserHasRequestedRestore, requestClone ] );

	// Takes a destination as a vault role or blog id
	const onSetDestination = useCallback(
		( role: string ) => {
			setCloneDestination( role );
			setUserHasSetDestination( true );
		},
		[ setUserHasSetDestination, setCloneDestination ]
	);

	const onSetBackupPeriod = useCallback(
		( period: string ) => {
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
	const trackedSetLatestBackupPeriod = useTrackCallback(
		onSetBackupPeriod,
		'calypso_jetpack_clone_flow_set_backup_period_latest'
	);
	const trackedSetOtherBackupPeriod = useTrackCallback(
		onSetBackupPeriod,
		'calypso_jetpack_clone_flow_set_backup_period_other'
	);

	const loading = rewindState.state === 'uninitialized';

	const disableClone = false;

	const { data: logs } = useRewindableActivityLogQuery(
		siteId,
		{},
		{ enabled: !! siteId }
	) as UseQueryResult< ActivityLogEntry[] >;
	const lastBackup = logs && logs.length > 0 ? logs[ 0 ] : undefined;

	// Screen that allows user to add credentials for an alternate restore / clone
	const renderSetDestination = () => (
		<>
			<CloneFlowStepProgress currentStep="destination" />
			<h3 className="clone-flow__title">{ translate( 'Set a destination site' ) }</h3>
			<p className="clone-flow__info">{ translate( 'Where do you want to copy this site to?' ) }</p>
			<div className="clone-flow__advanced-credentials">
				<CloneFlowSuggestionSearch
					loading={ isLoadingStagingSites }
					siteSuggestions={ stagingSites }
					onSearchChange={ onSearchChange }
					onAddNewClick={ onAddNewClick }
				/>
				{ showCredentialForm && (
					<AdvancedCredentials
						action={ CredSettings.action }
						host={ CredSettings.host }
						role={ CredSettings.role }
						onFinishCallback={ () => onSetDestination( CredSettings.role ) }
						redirectOnFinish={ false }
						goBackPath={ previousPath }
					/>
				) }
			</div>
		</>
	);

	// Screen that allows user to select a backup point to clone
	const renderSetBackupPeriod = () => (
		<>
			<CloneFlowStepProgress currentStep="clonePoint" />
			<h3 className="clone-flow__title">{ translate( 'Select a point to copy' ) }</h3>
			<p className="clone-flow__info">
				{ translate( 'What do you want to copy to {{strong}}%(destinationUrl)s{{/strong}}?', {
					args: {
						destinationUrl: getDestinationUrl(),
					},
					components: {
						strong: <strong />,
					},
				} ) }
			</p>
			<div className="activity-log-v2__content">
				{ lastBackup && (
					<Card>
						<BackupSuccessful
							backup={ lastBackup }
							selectedDate={ moment( lastBackup.activityDate ) }
							lastBackupAttemptOnDate={ undefined }
							availableActions={ [ 'clone' ] }
							onClickClone={ trackedSetLatestBackupPeriod }
						/>
					</Card>
				) }
				<ActivityCardList
					logs={ logs?.slice( 1 ) ?? [] }
					pageSize={ 10 }
					showFilter={ false }
					availableActions={ [ 'clone' ] }
					onClickClone={ trackedSetOtherBackupPeriod }
				/>
			</div>
		</>
	);

	const confirmationPopoverContent = (
		<>
			<div className="clone-flow__confirmation-popover-heading">{ translate( 'Important!' ) }</div>
			<div className="clone-flow__confirmation-popover-info">
				{ translate(
					'Before continuing, be aware that any current content on {{strong}}%(destinationUrl)s{{/strong}} will be overriden based on what you configured to copy.',
					{
						args: {
							destinationUrl: getDestinationUrl(),
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</div>
			<div className="clone-flow__confirmation-popover-info">
				{ translate( 'Do you want to continue?' ) }
			</div>
		</>
	);

	const showConfirmationPopover = () =>
		accept(
			confirmationPopoverContent,
			( accepted: boolean ) => ( accepted ? onConfirm() : undefined ),
			'Yes, continue',
			'No, cancel',
			{ additionalClassNames: 'clone-flow__confirmation-popover' }
		);

	const goBackFromConfirm = () => {
		setUserHasSetBackupPeriod( false );
		dispatch( recordTracksEvent( 'calypso_jetpack_clone_flow_back_from_configure' ) );
	};

	// Screen that allows the user to configure which items to clone
	const renderConfirm = () => (
		<>
			<CloneFlowStepProgress currentStep="configure" />
			<h3 className="clone-flow__title">{ translate( 'Configure your copy' ) }</h3>
			<p className="clone-flow__info">
				{ translate(
					'Select the items you want to copy to {{strong}}%(destinationUrl)s{{/strong}}.',
					{
						args: {
							destinationUrl: getDestinationUrl(),
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<Card>
				<p className="clone-flow__info">
					{ translate(
						'{{strong}}%(backupDisplayDate)s{{/strong}} is the selected point to copy.',
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
				<h4 className="clone-flow__cta">
					{ translate( 'Choose the items you wish to restore:' ) }
				</h4>
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
					<Button className="clone-flow__back-button" onClick={ goBackFromConfirm }>
						{ translate( 'Go back' ) }
					</Button>
					<Button
						className="clone-flow__primary-button"
						primary
						onClick={ showConfirmationPopover }
						disabled={ disableClone }
					>
						{ translate( 'Confirm configuration' ) }
					</Button>
				</div>
			</Card>
			<Interval onTick={ refreshBackups } period={ EVERY_FIVE_SECONDS } />
		</>
	);

	const renderInProgress = () => (
		<>
			<Card>
				<div className="clone-flow__progress-header">
					<img
						src="/calypso/images/illustrations/jetpack-backup-copy.svg"
						alt="jetpack cloud restore success"
						height="48"
					/>
				</div>
				<h3 className="clone-flow__progress-title">
					{ translate( 'Copying site to %(destinationUrl)s', {
						args: {
							backupDisplayDate,
							destinationUrl: getDestinationUrl(),
						},
					} ) }
				</h3>
				<ProgressBar
					isReady={ 'running' === inProgressRewindStatus }
					initializationMessage={ translate( 'Initializing the copy process' ) }
					message={ message }
					entry={ currentEntry }
					percent={ percent }
				/>
				<p className="clone-flow__info">
					{ translate(
						'Jetpack is copying your site. You will be notified when the process is finished in the activity log.'
					) }
				</p>
				<Button
					className="clone-flow__activity-log-button"
					href={ activityLogPath }
					onClick={ () =>
						dispatch( recordTracksEvent( 'calypso_jetpack_clone_flow_in_progress_activity_log' ) )
					}
				>
					{ translate( 'Go to Activity Log' ) }
				</Button>
			</Card>
		</>
	);

	const renderFinished = () => (
		<>
			<Card>
				<div className="clone-flow__progress-header">
					<img
						src="/calypso/images/illustrations/jetpack-backup-copy-success.svg"
						alt="jetpack cloud restore success"
						height="48"
					/>
				</div>
				<h3 className="clone-flow__progress-title">
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
				<Button
					className="clone-flow__activity-log-button"
					href={ activityLogPath }
					onClick={ () =>
						dispatch( recordTracksEvent( 'calypso_jetpack_clone_flow_finished_activity_log' ) )
					}
				>
					{ translate( 'Go to Activity Log' ) }
				</Button>
				<Button
					primary
					href={ getDestinationUrl() }
					target="_blank"
					onClick={ () =>
						dispatch( recordTracksEvent( 'calypso_jetpack_clone_flow_finished_view_site' ) )
					}
				>
					{ translate( 'View your website' ) }
					<Gridicon icon="external" size={ 18 } />
				</Button>
			</Card>
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
	const isInProgress =
		( ! inProgressRewindStatus && userHasRequestedRestore && userHasSetDestination ) ||
		( inProgressRewindStatus && [ 'queued', 'running' ].includes( inProgressRewindStatus ) );
	const isFinished = inProgressRewindStatus !== null && inProgressRewindStatus === 'finished';

	useEffect( () => {
		if ( isFinished ) {
			dispatch( recordTracksEvent( 'calypso_jetpack_clone_flow_completed' ) );
		}
	}, [ dispatch, isFinished ] );

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
					<QueryBackupStagingSitesList siteId={ siteId } />
					{ restoreId && isInProgress && (
						<QueryRewindRestoreStatus siteId={ restoreSiteId } restoreId={ restoreId } />
					) }
					{ render() }
				</div>
			</Main>
		</>
	);
};

export default BackupCloneFlow;
