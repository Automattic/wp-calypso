import { Card } from '@automattic/components';
import { isDesktop, isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import Spinner from 'calypso/components/spinner';
import withBlockEditorSettings from 'calypso/data/block-editor/with-block-editor-settings';
import useSkipCurrentViewMutation from 'calypso/data/home/use-skip-current-view-mutation';
import { getTaskList } from 'calypso/lib/checklist';
import { navigate } from 'calypso/lib/navigate';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestSiteChecklistTaskUpdate } from 'calypso/state/checklist/actions';
import { resetVerifyEmailState } from 'calypso/state/current-user/email-verification/actions';
import { getCurrentUser, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import { requestGuidedTour } from 'calypso/state/guided-tours/actions';
import getChecklistTaskUrls from 'calypso/state/selectors/get-checklist-task-urls';
import getSiteChecklist from 'calypso/state/selectors/get-site-checklist';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { useSiteOption } from 'calypso/state/sites/hooks';
import { getSiteOption, getSiteSlug, getCustomizerUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CurrentTaskItem from './current-task-item';
import { getTask } from './get-task';
import MobileAppDownload from './mobile-app-download';
import NavItem from './nav-item';

/**
 * Import Styles
 */
import './style.scss';

const startTask = ( dispatch, task, siteId, advanceToNextIncompleteTask, isPodcastingSite ) => {
	dispatch(
		recordTracksEvent( 'calypso_checklist_task_start', {
			checklist_name: 'new_blog',
			site_id: siteId,
			location: 'checklist_show',
			step_name: task.id,
			completed: task.isCompleted,
			is_podcasting_site: isPodcastingSite,
		} )
	);

	if ( task.tour && ! task.isCompleted && isDesktop() ) {
		dispatch( requestGuidedTour( task.tour ) );
	}

	if ( task.actionUrl ) {
		navigate( task.actionUrl );
	}

	if ( task.actionDispatch ) {
		dispatch( task.actionDispatch( ...task.actionDispatchArgs ) );
	}

	if ( task.actionAdvanceToNext ) {
		advanceToNextIncompleteTask();
	}
};

const skipTask = (
	dispatch,
	skipCurrentView,
	task,
	tasks,
	siteId,
	setIsLoading,
	isPodcastingSite
) => {
	const isLastTask = tasks.filter( ( t ) => ! t.isCompleted ).length === 1;

	if ( isLastTask ) {
		// When skipping the last task, we request skipping the current layout view so it's refreshed afterwards.
		// Task will be dismissed server-side to avoid race conditions.
		setIsLoading( true );
		skipCurrentView();
	} else {
		// Otherwise we simply skip the given task.
		dispatch( requestSiteChecklistTaskUpdate( siteId, task.id ) );
	}
	dispatch(
		recordTracksEvent( 'calypso_checklist_task_dismiss', {
			checklist_name: 'new_blog',
			site_id: siteId,
			step_name: task.id,
			is_podcasting_site: isPodcastingSite,
		} )
	);
};

const trackTaskDisplay = ( dispatch, task, siteId, isPodcastingSite ) => {
	dispatch(
		recordTracksEvent( 'calypso_checklist_task_display', {
			checklist_name: 'new_blog',
			site_id: siteId,
			step_name: task.id,
			completed: task.isCompleted,
			location: 'home',
			is_podcasting_site: isPodcastingSite,
		} )
	);
};

const SiteSetupList = ( {
	emailVerificationStatus,
	firstIncompleteTask,
	isEmailUnverified,
	isPodcastingSite,
	isFSEActive,
	menusUrl,
	siteId,
	siteSlug,
	tasks,
	taskUrls,
	userEmail,
} ) => {
	const [ currentTaskId, setCurrentTaskId ] = useState( null );
	const [ currentTask, setCurrentTask ] = useState( null );
	const [ taskIsManuallySelected, setTaskIsManuallySelected ] = useState( false );
	const [ useAccordionLayout, setUseAccordionLayout ] = useState( false );
	const [ showAccordionSelectedTask, setShowAccordionSelectedTask ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const dispatch = useDispatch();
	const { skipCurrentView } = useSkipCurrentViewMutation( siteId );

	const isDomainUnverified =
		tasks.filter(
			( task ) => task.id === CHECKLIST_KNOWN_TASKS.DOMAIN_VERIFIED && ! task.isCompleted
		).length > 0;

	const siteIntent = useSiteOption( 'site_intent' );
	const isBlogger = siteIntent === 'write';

	// Move to first incomplete task on first load.
	useEffect( () => {
		if ( ! currentTaskId && tasks.length ) {
			const initialTask = tasks.find( ( task ) => ! task.isCompleted );
			if ( initialTask ) {
				setCurrentTaskId( initialTask.id );
			}
		}
	}, [ currentTaskId, dispatch, tasks ] );

	// If specified, then automatically complete the current task when viewed
	// if it is not already complete.
	useEffect( () => {
		if ( currentTask?.completeOnView && ! currentTask?.isCompleted ) {
			dispatch( requestSiteChecklistTaskUpdate( siteId, currentTask.id ) );
			setTaskIsManuallySelected( true ); // force selected even though complete
		}
	}, [ currentTask, dispatch, siteId ] );

	// Reset verification email state on first load.
	useEffect( () => {
		if ( isEmailUnverified ) {
			dispatch( resetVerifyEmailState() );
		}
	}, [ isEmailUnverified, dispatch ] );

	// Move to next task after completing current one, unless directly selected by the user.
	useEffect( () => {
		if ( taskIsManuallySelected ) {
			return;
		}
		if ( currentTaskId && currentTask && tasks.length ) {
			const rawCurrentTask = tasks.find( ( task ) => task.id === currentTaskId );
			if ( rawCurrentTask.isCompleted && ! currentTask.isCompleted ) {
				const nextTaskId = tasks.find( ( task ) => ! task.isCompleted )?.id;
				setTaskIsManuallySelected( false );
				setCurrentTaskId( nextTaskId );
			}
		}
	}, [ currentTask, currentTaskId, taskIsManuallySelected, tasks ] );

	// Update current task.
	useEffect( () => {
		if ( currentTaskId && tasks.length ) {
			const rawTask = tasks.find( ( task ) => task.id === currentTaskId );
			const newCurrentTask = getTask( rawTask, {
				emailVerificationStatus,
				isDomainUnverified,
				isEmailUnverified,
				menusUrl,
				siteId,
				siteSlug,
				taskUrls,
				userEmail,
				isBlogger,
				isFSEActive,
			} );
			setCurrentTask( newCurrentTask );
			trackTaskDisplay( dispatch, newCurrentTask, siteId, isPodcastingSite );
		}
	}, [
		currentTaskId,
		dispatch,
		emailVerificationStatus,
		isDomainUnverified,
		isEmailUnverified,
		isPodcastingSite,
		menusUrl,
		siteId,
		siteSlug,
		tasks,
		taskUrls,
		userEmail,
		isBlogger,
	] );

	useEffect( () => {
		if ( isWithinBreakpoint( '<960px' ) ) {
			setUseAccordionLayout( true );
		}
		subscribeIsWithinBreakpoint( '<960px', ( isActive ) => setUseAccordionLayout( isActive ) );
	}, [] );

	if ( ! currentTask ) {
		return null;
	}

	const advanceToNextIncompleteTask = () => {
		if ( firstIncompleteTask ) {
			setCurrentTaskId( firstIncompleteTask.id );
		}
	};

	const isMobileAppTaskCompleted = tasks.some(
		( task ) => task.id === CHECKLIST_KNOWN_TASKS.MOBILE_APP_INSTALLED && task.isCompleted
	);

	return (
		<Card className={ classnames( 'site-setup-list', { 'is-loading': isLoading } ) }>
			{ isLoading && <Spinner /> }
			{ ! useAccordionLayout && (
				<CurrentTaskItem
					currentTask={ currentTask }
					skipTask={ () => {
						setTaskIsManuallySelected( false );
						skipTask(
							dispatch,
							skipCurrentView,
							currentTask,
							tasks,
							siteId,
							setIsLoading,
							isPodcastingSite
						);
					} }
					startTask={ () =>
						startTask(
							dispatch,
							currentTask,
							siteId,
							advanceToNextIncompleteTask,
							isPodcastingSite
						)
					}
				/>
			) }

			<div className="site-setup-list__nav">
				<CardHeading tagName="h2">
					{ isBlogger ? translate( 'Blog setup' ) : translate( 'Site setup' ) }
				</CardHeading>
				<ul
					className={ classnames( 'site-setup-list__list', {
						'is-mobile-app-completed': isMobileAppTaskCompleted,
					} ) }
					role="tablist"
					aria-label="Site setup"
					aria-orientation="vertical"
				>
					{ tasks.map( ( task ) => {
						const enhancedTask = getTask( task, { isBlogger, userEmail } );
						const isCurrent = task.id === currentTask.id;
						const isCompleted = task.isCompleted;

						return (
							<li key={ task.id } className={ `site-setup-list__task-${ task.id }` }>
								<NavItem
									key={ task.id }
									taskId={ task.id }
									text={ enhancedTask.label || enhancedTask.title }
									isCompleted={ isCompleted }
									isCurrent={
										useAccordionLayout ? isCurrent && showAccordionSelectedTask : isCurrent
									}
									timing={ enhancedTask.timing }
									onClick={
										useAccordionLayout && isCurrent && showAccordionSelectedTask
											? () => {
													setShowAccordionSelectedTask( false );
											  }
											: () => {
													setShowAccordionSelectedTask( true );
													setTaskIsManuallySelected( true );
													setCurrentTaskId( task.id );
											  }
									}
									useAccordionLayout={ useAccordionLayout }
								/>
								{ useAccordionLayout && isCurrent && showAccordionSelectedTask ? (
									<CurrentTaskItem
										currentTask={ currentTask }
										skipTask={ () => {
											setTaskIsManuallySelected( false );
											skipTask(
												dispatch,
												skipCurrentView,
												currentTask,
												tasks,
												siteId,
												setIsLoading,
												isPodcastingSite
											);
										} }
										startTask={ () =>
											startTask(
												dispatch,
												currentTask,
												siteId,
												advanceToNextIncompleteTask,
												isPodcastingSite
											)
										}
										useAccordionLayout={ useAccordionLayout }
									/>
								) : null }
							</li>
						);
					} ) }
				</ul>
				{ ! isMobileAppTaskCompleted && <MobileAppDownload /> }
			</div>
		</Card>
	);
};

const ConnectedSiteSetupList = connect( ( state, props ) => {
	const { blockEditorSettings } = props;

	const isFSEActive = blockEditorSettings?.is_fse_active ?? false;
	const siteId = getSelectedSiteId( state );
	const user = getCurrentUser( state );
	const designType = getSiteOption( state, siteId, 'design_type' );
	const siteChecklist = getSiteChecklist( state, siteId );
	const siteSegment = siteChecklist?.segment;
	const siteVerticals = siteChecklist?.vertical;
	const taskStatuses = siteChecklist?.tasks;
	const siteIsUnlaunched = isUnlaunchedSite( state, siteId );
	const taskList = getTaskList( {
		taskStatuses,
		designType,
		siteIsUnlaunched,
		siteSegment,
		siteVerticals,
	} );
	// Existing usage didn't have a global selector, we can tidy this in a follow up.
	const emailVerificationStatus = state?.currentUser?.emailVerification?.status;

	return {
		emailVerificationStatus,
		firstIncompleteTask: taskList.getFirstIncompleteTask(),
		isEmailUnverified: ! isCurrentUserEmailVerified( state ),
		isFSEActive,
		isPodcastingSite: !! getSiteOption( state, siteId, 'anchor_podcast' ),
		menusUrl: getCustomizerUrl( state, siteId, null, null, 'add-menu' ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		tasks: taskList.getAll(),
		taskUrls: getChecklistTaskUrls( state, siteId ),
		userEmail: user?.email,
	};
} )( SiteSetupList );

export default withBlockEditorSettings( ConnectedSiteSetupList );
