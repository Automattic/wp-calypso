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
import CardHeading from 'components/card-heading';
import Spinner from 'components/spinner';
import { getTaskList } from 'lib/checklist';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { resetVerifyEmailState } from 'state/current-user/email-verification/actions';
import { getCurrentUser, isCurrentUserEmailVerified } from 'state/current-user/selectors';
import getChecklistTaskUrls from 'state/selectors/get-checklist-task-urls';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import getMenusUrl from 'state/selectors/get-menus-url';
import { getSiteOption, getSiteSlug } from 'state/sites/selectors';
import { requestGuidedTour } from 'state/guided-tours/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { skipCurrentViewHomeLayout } from 'state/home/actions';
import NavItem from './nav-item';
import CurrentTaskItem from './current-task-item';
import { CHECKLIST_KNOWN_TASKS } from 'state/data-layer/wpcom/checklist/index.js';
import { getTask } from './get-task';

/**
 * Style dependencies
 */
import './style.scss';

const startTask = ( dispatch, task, siteId, advanceToNextIncompleteTask ) => {
	dispatch(
		recordTracksEvent( 'calypso_checklist_task_start', {
			checklist_name: 'new_blog',
			site_id: siteId,
			location: 'checklist_show',
			step_name: task.id,
			completed: task.isCompleted,
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

const skipTask = ( dispatch, task, tasks, siteId, setIsLoading ) => {
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
		} )
	);
};

const trackTaskDisplay = ( dispatch, task, siteId ) => {
	dispatch(
		recordTracksEvent( 'calypso_checklist_task_display', {
			checklist_name: 'new_blog',
			site_id: siteId,
			step_name: task.id,
			completed: task.isCompleted,
			location: 'home',
		} )
	);
};

const SiteSetupList = ( {
	emailVerificationStatus,
	isEmailUnverified,
	menusUrl,
	siteId,
	siteSlug,
	tasks,
	taskUrls,
	userEmail,
	firstIncompleteTask,
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
				menusUrl,
				siteId,
				siteSlug,
				taskUrls,
				userEmail,
			} );
			setCurrentTask( newCurrentTask );
			trackTaskDisplay( dispatch, newCurrentTask, siteId );
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
						skipTask( dispatch, currentTask, tasks, siteId, setIsLoading );
					} }
					startTask={ () =>
						startTask( dispatch, currentTask, siteId, advanceToNextIncompleteTask )
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
										skipTask( dispatch, currentTask, tasks, siteId, setIsLoading );
									} }
									startTask={ () =>
										startTask( dispatch, currentTask, siteId, advanceToNextIncompleteTask )
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
		isEmailUnverified: ! isCurrentUserEmailVerified( state ),
		menusUrl: getMenusUrl( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		tasks: taskList.getAll(),
		taskUrls: getChecklistTaskUrls( state, siteId ),
		userEmail: user?.email,
		firstIncompleteTask: taskList.getFirstIncompleteTask(),
	};
} )( SiteSetupList );
