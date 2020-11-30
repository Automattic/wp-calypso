/**
 * External dependencies
 */
import { Card } from '@automattic/components';
import { isDesktop, isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import { translate } from 'i18n-calypso';
import React, { useEffect, useState, Fragment } from 'react';
import { connect, useDispatch } from 'react-redux';
import page from 'page';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import CardHeading from 'calypso/components/card-heading';
import Spinner from 'calypso/components/spinner';
import { getTaskList } from 'calypso/lib/checklist';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestSiteChecklistTaskUpdate } from 'calypso/state/checklist/actions';
import { resetVerifyEmailState } from 'calypso/state/current-user/email-verification/actions';
import { getCurrentUser, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import getChecklistTaskUrls from 'calypso/state/selectors/get-checklist-task-urls';
import getSiteChecklist from 'calypso/state/selectors/get-site-checklist';
import isUnlaunchedSite from 'calypso/state/selectors/is-unlaunched-site';
import getMenusUrl from 'calypso/state/selectors/get-menus-url';
import { getSiteOption, getSiteSlug } from 'calypso/state/sites/selectors';
import { requestGuidedTour } from 'calypso/state/guided-tours/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { skipCurrentViewHomeLayout } from 'calypso/state/home/actions';
import NavItem from './nav-item';
import CurrentTaskItem from './current-task-item';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import { getTask } from './get-task';

/**
 * Style dependencies
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
		page.show( task.actionUrl );
	}

	if ( task.actionDispatch ) {
		dispatch( task.actionDispatch( ...task.actionDispatchArgs ) );
	}

	if ( task.actionAdvanceToNext ) {
		advanceToNextIncompleteTask();
	}
};

const skipTask = ( dispatch, task, tasks, siteId, setIsLoading, isPodcastingSite ) => {
	const isLastTask = tasks.filter( ( t ) => ! t.isCompleted ).length === 1;

	if ( isLastTask ) {
		// When skipping the last task, we request skipping the current layout view so it's refreshed afterwards.
		// Task will be dismissed server-side to avoid race conditions.
		setIsLoading( true );
		dispatch( skipCurrentViewHomeLayout( siteId ) );
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

	const isDomainUnverified =
		tasks.filter(
			( task ) => task.id === CHECKLIST_KNOWN_TASKS.DOMAIN_VERIFIED && ! task.isCompleted
		).length > 0;

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
				isPodcastingSite,
				menusUrl,
				siteId,
				siteSlug,
				taskUrls,
				userEmail,
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
		menusUrl,
		siteId,
		siteSlug,
		tasks,
		taskUrls,
		userEmail,
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
		setCurrentTaskId( firstIncompleteTask.id );
	};

	return (
		<Card className={ classnames( 'site-setup-list', { 'is-loading': isLoading } ) }>
			{ isLoading && <Spinner /> }
			{ ! useAccordionLayout && (
				<CurrentTaskItem
					currentTask={ currentTask }
					skipTask={ () => {
						setTaskIsManuallySelected( false );
						skipTask( dispatch, currentTask, tasks, siteId, setIsLoading, isPodcastingSite );
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
				<CardHeading>{ translate( 'Site setup' ) }</CardHeading>
				{ tasks.map( ( task ) => {
					const enhancedTask = getTask( task );
					const isCurrent = task.id === currentTask.id;
					const isCompleted = task.isCompleted;

					return (
						<Fragment key={ task.id }>
							<NavItem
								key={ task.id }
								taskId={ task.id }
								text={ enhancedTask.label || enhancedTask.title }
								isCompleted={ isCompleted }
								isCurrent={
									useAccordionLayout ? isCurrent && showAccordionSelectedTask : isCurrent
								}
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
						</Fragment>
					);
				} ) }
			</div>
		</Card>
	);
};

export default connect( ( state ) => {
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
		isPodcastingSite: !! getSiteOption( state, siteId, 'anchor_podcast' ),
		menusUrl: getMenusUrl( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		tasks: taskList.getAll(),
		taskUrls: getChecklistTaskUrls( state, siteId ),
		userEmail: user?.email,
	};
} )( SiteSetupList );
