/* eslint-disable prettier/prettier */
import { Card, Spinner } from '@automattic/components';
import { isDesktop, isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import clsx from 'clsx';
import { translate, useRtl } from 'i18n-calypso';
import { memoize } from 'lodash';
import { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import QuerySiteChecklist from 'calypso/components/data/query-site-checklist';
import useSkipCurrentViewMutation from 'calypso/data/home/use-skip-current-view-mutation';
import withIsFSEActive from 'calypso/data/themes/with-is-fse-active';
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
import getSites from 'calypso/state/selectors/get-sites';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import { useSiteOption } from 'calypso/state/sites/hooks';
import { getSiteOption, getSiteSlug, getCustomizerUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import CurrentTaskItem from './current-task-item';
import { getTask } from './get-task';
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

const unverifiedEmailTaskComparator = memoize(
	( isEmailUnverified ) => ( task ) =>
		isEmailUnverified && CHECKLIST_KNOWN_TASKS.EMAIL_VERIFIED === task.id ? -1 : 0
);

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
	siteCount,
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
	const isRtl = useRtl();

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
			if ( rawCurrentTask?.isCompleted && ! currentTask.isCompleted ) {
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
				isRtl,
				siteCount,
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
		isFSEActive,
		isRtl,
		siteCount,
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

	return (
		<Card className={ clsx( 'site-setup-list', { 'is-loading': isLoading } ) }>
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
					className="site-setup-list__list"
					role="tablist"
					aria-label="Site setup"
					aria-orientation="vertical"
				>
					{ tasks.map( ( task ) => {
						const enhancedTask = getTask( task, { isBlogger, isFSEActive, userEmail } );
						const isCurrent = task.id === currentTask.id;
						const isCompleted = task.isCompleted;

						return (
							<li
								key={ task.id }
								className={ `site-setup-list__task-${ task.id }` }
								role="presentation"
							>
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
			</div>
		</Card>
	);
};

const ConnectedSiteSetupList = connect( ( state, props ) => {
	const { isFSEActive } = props;
	const siteCount = getSites( state ).length;
	const siteId = getSelectedSiteId( state );
	const user = getCurrentUser( state );
	const designType = getSiteOption( state, siteId, 'design_type' );
	const siteChecklist = getSiteChecklist( state, siteId );
	const siteSegment = siteChecklist?.segment;
	const taskStatuses = siteChecklist?.tasks;
	const siteIsUnlaunched = isUnlaunchedSite( state, siteId );
	const taskList = getTaskList( {
		taskStatuses,
		designType,
		siteIsUnlaunched,
		siteSegment,
	} );
	// Existing usage didn't have a global selector, we can tidy this in a follow up.
	const emailVerificationStatus = state?.currentUser?.emailVerification?.status;
	const isEmailUnverified = ! isCurrentUserEmailVerified( state );

	return {
		emailVerificationStatus,
		firstIncompleteTask: taskList.getFirstIncompleteTask(),
		isEmailUnverified,
		isFSEActive,
		isPodcastingSite: !! getSiteOption( state, siteId, 'anchor_podcast' ),
		menusUrl: getCustomizerUrl( state, siteId, null, null, 'add-menu' ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		tasks: taskList.getAllSorted( unverifiedEmailTaskComparator( isEmailUnverified ) ),
		taskUrls: getChecklistTaskUrls( state, siteId ),
		userEmail: user?.email,
		siteCount,
	};
} )( SiteSetupList );

const WithIsFSEActiveSiteSetupList = withIsFSEActive( ConnectedSiteSetupList );
export default WithIsFSEActiveSiteSetupList;

const SiteSetupListWrapper = ( { siteId } ) => {
	if ( ! siteId ) {
		return null;
	}
	return (
		<>
			<QuerySiteChecklist siteId={ siteId } />
			<WithIsFSEActiveSiteSetupList />
		</>
	);
};

export const ConnectedSiteSetupListWrapper = connect( ( state ) => ( {
	siteId: getSelectedSiteId( state ),
} ) )( SiteSetupListWrapper );
