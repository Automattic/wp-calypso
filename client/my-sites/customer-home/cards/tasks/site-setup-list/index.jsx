/**
 * External dependencies
 */
import { Card, Button } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
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
import CardHeading from 'components/card-heading';
import { getTaskList } from 'lib/checklist';
import Gridicon from 'components/gridicon';
import { recordTracksEvent } from 'state/analytics/actions';
import { requestSiteChecklistTaskUpdate } from 'state/checklist/actions';
import getChecklistTaskUrls from 'state/selectors/get-checklist-task-urls';
import getSiteChecklist from 'state/selectors/get-site-checklist';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import getMenusUrl from 'state/selectors/get-menus-url';
import { getSiteOption, getSiteSlug } from 'state/sites/selectors';
import { requestGuidedTour } from 'state/ui/guided-tours/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import NavItem from './nav-item';
import { getTaskData } from './get-task-data';

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

const SiteSetupList = ( { menusUrl, siteId, siteSlug, tasks, taskUrls } ) => {
	const [ currentTask, setCurrentTask ] = useState( null );
	const dispatch = useDispatch();

	const getTask = ( task ) =>
		getTaskData( task, {
			menusUrl,
			siteId,
			siteSlug,
			taskUrls,
		} );

	useEffect( () => {
		// Initial task.
		if ( ! currentTask && tasks.length ) {
			const initialTask = getTask( tasks.find( ( task ) => ! task.isCompleted ) );
			setCurrentTask( initialTask );
		}

		// Move to next task after after completing current one.
		if ( currentTask && tasks.length ) {
			const isCurrentTaskCompleted = tasks.find( ( task ) => task.id === currentTask.id )
				.isCompleted;
			if ( isCurrentTaskCompleted && ! currentTask.isCompleted ) {
				const nextTask = getTask( tasks.find( ( task ) => ! task.isCompleted ) );
				setCurrentTask( nextTask );
			}
		}
	}, [ currentTask, tasks ] );

	if ( ! tasks.length || ! currentTask ) {
		return null;
	}

	return (
		<Card className="site-setup-list">
			<div className="site-setup-list__nav">
				<CardHeading>{ translate( 'Site setup' ) }</CardHeading>
				{ tasks.map( ( task ) => {
					const taskData = getTask( task );
					return (
						<NavItem
							key={ task.id }
							text={ task.isCompleted ? taskData.completed.title : taskData.todo.title }
							isCompleted={ task.isCompleted }
							isCurrent={ task.id === currentTask.id }
							onClick={ () => setCurrentTask( taskData ) }
						/>
					);
				} ) }
			</div>
			{ ! currentTask.isCompleted ? (
				<ActionPanel className="site-setup-list__task task">
					<ActionPanelBody>
						<div className="site-setup-list__task-text task__text">
							<div className="site-setup-list__task-timing task__timing">
								<Gridicon icon="time" size={ 18 } />
								<p>
									{ translate( '%d minute', '%d minutes', {
										count: currentTask.todo.timing,
										args: [ currentTask.todo.timing ],
									} ) }
								</p>
							</div>
							<ActionPanelTitle>{ currentTask.todo.title }</ActionPanelTitle>
							<p className="site-setup-list__task-description task__description">
								{ currentTask.todo.description }
							</p>
							<ActionPanelCta>
								<Button
									className="site-setup-list__task-action task__action"
									primary
									onClick={ () => startTask( dispatch, currentTask, siteId ) }
								>
									{ currentTask.todo.actionText }
								</Button>
								{ currentTask.todo.isSkippable && (
									<Button
										className="site-setup-list__task-skip task__skip is-link"
										onClick={ () => skipTask( dispatch, currentTask.todo, siteId ) }
									>
										{ translate( 'Skip for now' ) }
									</Button>
								) }
							</ActionPanelCta>
						</div>
					</ActionPanelBody>
				</ActionPanel>
			) : (
				<ActionPanel className="site-setup-list__task task">
					<ActionPanelBody>
						<div className="site-setup-list__task-text task__text">
							<ActionPanelTitle>{ currentTask.completed.title }</ActionPanelTitle>
							<p className="site-setup-list__task-description task__description">
								{ currentTask.completed.description }
							</p>
							<ActionPanelCta>
								<Button
									className="site-setup-list__task-action task__action"
									primary
									onClick={ () => startTask( dispatch, currentTask, siteId ) }
								>
									{ currentTask.completed.actionText }
								</Button>
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

	return {
		menusUrl: getMenusUrl( state, siteId ),
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		tasks: taskList.getAll(),
		taskUrls: getChecklistTaskUrls( state, siteId ),
	};
} )( SiteSetupList );
