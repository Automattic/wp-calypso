/**
 * External dependencies
 */
import { Card, Button } from '@automattic/components';
import { isDesktop, isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import { translate } from 'i18n-calypso';
import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import ActionPanel from 'components/action-panel';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import ActionPanelCta from 'components/action-panel/cta';
import Badge from 'components/badge';
import CardHeading from 'components/card-heading';
import { getTaskList } from 'lib/checklist';
import Gridicon from 'components/gridicon';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import { resetVerifyEmailState } from 'state/current-user/email-verification/actions';
import { getCurrentUser, isCurrentUserEmailVerified } from 'state/current-user/selectors';
import getChecklistTaskUrls from 'state/selectors/get-checklist-task-urls';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import getMenusUrl from 'state/selectors/get-menus-url';
import { getSiteOption, getSiteSlug } from 'state/sites/selectors';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import NavItem from './nav-item';
import { getTask } from './get-task';

/**
 * Style dependencies
 */
import './style.scss';

const startTask = ( dispatch, task, siteId ) => {
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
};

const skipTask = ( dispatch, task, siteId ) => {
	dispatch( requestSiteChecklistTaskUpdate( siteId, task.id ) );
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

const getActionText = ( currentTask, emailVerificationStatus ) => {
	if ( currentTask.id === 'email_verified' ) {
		if ( emailVerificationStatus === 'requesting' ) {
			return translate( 'Sending…' );
		}

		if ( emailVerificationStatus === 'error' ) {
			return translate( 'Error' );
		}

		if ( emailVerificationStatus === 'sent' ) {
			return translate( 'Email sent' );
		}
	}
	return currentTask.actionText;
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
} ) => {
	const [ currentTaskId, setCurrentTaskId ] = useState( null );
	const [ currentTask, setCurrentTask ] = useState( null );
	const [ useDrillLayout, setUseDrillLayout ] = useState( false );
	const [ currentDrillLayoutView, setCurrentDrillLayoutView ] = useState( 'nav' );
	const dispatch = useDispatch();

	const isDomainUnverified =
		tasks.filter( ( task ) => task.id === 'domain_verified' && ! task.isCompleted ).length > 0;

	useEffect( () => {
		// Initial task (first incomplete).
		if ( ! currentTaskId && tasks.length ) {
			const initialTaskId = tasks.find( ( task ) => ! task.isCompleted ).id;
			setCurrentTaskId( initialTaskId );
		}

		// Reset verification email state on first load.
		if ( isEmailUnverified ) {
			dispatch( resetVerifyEmailState() );
		}
	}, [ currentTaskId, isEmailUnverified, tasks ] );

	// Move to next task after completing current one.
	useEffect( () => {
		if ( currentTaskId && currentTask && tasks.length ) {
			const rawCurrentTask = tasks.find( ( task ) => task.id === currentTaskId );
			if ( rawCurrentTask.isCompleted && ! currentTask.isCompleted ) {
				const nextTaskId = tasks.find( ( task ) => ! task.isCompleted ).id;
				setCurrentTaskId( nextTaskId );
			}
		}
	}, [ tasks ] );

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
	}, [ currentTaskId ] );

	useEffect( () => {
		if ( isWithinBreakpoint( '<960px' ) ) {
			setUseDrillLayout( true );
		}
		subscribeIsWithinBreakpoint( '<960px', ( isActive ) => setUseDrillLayout( isActive ) );
	}, [] );

	if ( ! currentTask ) {
		return null;
	}

	return (
		<Card className="site-setup-list">
			{ useDrillLayout && (
				<CardHeading>
					<>
						{ currentDrillLayoutView === 'task' && (
							<Gridicon
								icon="chevron-left"
								size={ 18 }
								className="site-setup-list__nav-back"
								onClick={ () => setCurrentDrillLayoutView( 'nav' ) }
							/>
						) }
						{ translate( 'Site setup' ) }
					</>
				</CardHeading>
			) }
			{ ( ! useDrillLayout || currentDrillLayoutView === 'nav' ) && (
				<div className="site-setup-list__nav">
					{ ! useDrillLayout && <CardHeading>{ translate( 'Site setup' ) }</CardHeading> }
					{ tasks.map( ( task ) => (
						<NavItem
							key={ task.id }
							taskId={ task.id }
							text={ getTask( task ).title }
							isCompleted={ task.isCompleted }
							isCurrent={ task.id === currentTask.id }
							onClick={ () => {
								setCurrentTaskId( task.id );
								setCurrentDrillLayoutView( 'task' );
							} }
							showChevron={ useDrillLayout }
						/>
					) ) }
				</div>
			) }
			{ ( ! useDrillLayout || currentDrillLayoutView === 'task' ) && (
				<ActionPanel className="site-setup-list__task task">
					<ActionPanelBody>
						<div className="site-setup-list__task-text task__text">
							<div className="site-setup-list__task-timing task__timing">
								{ currentTask.isCompleted ? (
									<Badge className="site-setup-list__badge" type="info">
										{ translate( 'Complete' ) }
									</Badge>
								) : (
									<>
										<Gridicon icon="time" size={ 18 } />
										<p>
											{ translate( '%d minute', '%d minutes', {
												count: currentTask.timing,
												args: [ currentTask.timing ],
											} ) }
										</p>
									</>
								) }
							</div>
							<ActionPanelTitle>{ currentTask.title }</ActionPanelTitle>
							<p className="site-setup-list__task-description task__description">
								{ currentTask.description }
							</p>
							<ActionPanelCta>
								<Button
									className="site-setup-list__task-action task__action"
									primary
									onClick={ () => startTask( dispatch, currentTask, siteId ) }
									disabled={ currentTask.isDisabled }
								>
									{ getActionText( currentTask, emailVerificationStatus ) }
								</Button>
								{ currentTask.isSkippable && ! currentTask.isCompleted && (
									<Button
										className="site-setup-list__task-skip task__skip is-link"
										onClick={ () => skipTask( dispatch, currentTask, siteId ) }
									>
										{ translate( 'Skip for now' ) }
									</Button>
								) }
							</ActionPanelCta>
						</div>
					</ActionPanelBody>
				</ActionPanel>
			) }
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
	};
} )( SiteSetupList );
