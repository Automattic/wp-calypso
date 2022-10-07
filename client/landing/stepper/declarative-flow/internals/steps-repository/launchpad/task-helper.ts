import { dispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import { PLANS_LIST } from 'calypso/../packages/calypso-products/src/plans-list';
import { SiteDetails } from 'calypso/../packages/data-stores/src';
import { NavigationControls } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { launchpadFlowTasks } from './tasks';
import { Task } from './types';

export function getEnhancedTasks(
	tasks: Task[] | null,
	siteSlug: string | null,
	site: SiteDetails | null,
	submit: NavigationControls[ 'submit' ],
	goToStep?: NavigationControls[ 'goToStep' ],
	flow?: string | null
) {
	const enhancedTaskList: Task[] = [];
	const productSlug = site?.plan?.product_slug;
	const translatedPlanName = productSlug ? PLANS_LIST[ productSlug ].getTitle() : '';

	const linkInBioLinksEditCompleted =
		site?.options?.launchpad_checklist_tasks_statuses?.links_edited || false;

	const linkInBioSiteLaunchCompleted =
		site?.options?.launchpad_checklist_tasks_statuses?.site_launched || false;

	tasks &&
		tasks.map( ( task ) => {
			let taskData = {};
			switch ( task.id ) {
				case 'setup_newsletter':
					taskData = {
						title: translate( 'Personalize Newsletter' ),
					};
					break;
				case 'plan_selected':
					taskData = {
						title: translate( 'Choose a Plan' ),
						keepActive: true,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.isCompleted, task.id );
							window.location.replace( `/plans/${ siteSlug }` );
						},
						badgeText: translatedPlanName,
					};
					break;
				case 'subscribers_added':
					taskData = {
						title: translate( 'Add Subscribers' ),
						keepActive: true,
						actionDispatch: () => {
							if ( goToStep ) {
								recordTaskClickTracksEvent( flow, task.isCompleted, task.id );
								goToStep( 'subscribers' );
							}
						},
					};
					break;
				case 'first_post_published':
					taskData = {
						title: translate( 'Write your first post' ),
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.isCompleted, task.id );
							window.location.replace( `/post/${ siteSlug }` );
						},
					};
					break;
				case 'design_selected':
					taskData = {
						title: translate( 'Select a design' ),
					};
					break;
				case 'setup_link_in_bio':
					taskData = {
						title: translate( 'Personalize Link in Bio' ),
						keepActive: true,
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.isCompleted, task.id );
							window.location.replace(
								`/setup/linkInBioPostSetup?flow=link-in-bio-post-setup&siteSlug=${ siteSlug }`
							);
						},
					};
					break;
				case 'links_added':
					taskData = {
						title: translate( 'Add links' ),
						actionDispatch: () => {
							recordTaskClickTracksEvent( flow, task.isCompleted, task.id );
							window.location.replace( `/site-editor/${ siteSlug }` );
						},
						keepActive: true,
						isCompleted: linkInBioLinksEditCompleted,
					};
					break;
				case 'link_in_bio_launched':
					taskData = {
						title: translate( 'Launch Link in bio' ),
						isCompleted: linkInBioSiteLaunchCompleted,
						dependencies: [ linkInBioLinksEditCompleted ],
						isLaunchTask: true,
						actionDispatch: () => {
							if ( site?.ID ) {
								const { setPendingAction, setProgressTitle } = dispatch( ONBOARD_STORE );
								const { launchSite } = dispatch( SITE_STORE );

								setPendingAction( async () => {
									setProgressTitle( __( 'Launching Link in bio' ) );
									await launchSite( site.ID );

									// Waits for half a second so that the loading screen doesn't flash away too quickly
									await new Promise( ( res ) => setTimeout( res, 500 ) );
									recordTaskClickTracksEvent( flow, task.isCompleted, task.id );
									window.location.replace( `/home/${ siteSlug }` );
								} );

								submit?.();
							}
						},
					};
					break;
			}
			enhancedTaskList.push( { ...task, ...taskData } );
		} );
	return enhancedTaskList;
}

// Records a generic task click Tracks event
function recordTaskClickTracksEvent(
	flow: string | null | undefined,
	isCompleted: boolean,
	taskId: string
) {
	recordTracksEvent( 'calypso_launchpad_task_clicked', {
		taskId,
		isCompleted,
		flow,
	} );
}

// Returns list of tasks/checklist items for a specific flow
export function getArrayOfFilteredTasks( tasks: Task[], flow: string | null ) {
	const currentFlowTasksIds = flow ? launchpadFlowTasks[ flow ] : null;
	return (
		currentFlowTasksIds &&
		currentFlowTasksIds.reduce( ( accumulator, currentTaskId ) => {
			tasks.find( ( task ) => {
				if ( task.id === currentTaskId ) {
					accumulator.push( task );
				}
			} );
			return accumulator;
		}, [] as Task[] )
	);
}

// This function will determine whether we want to disable or enable a task on the checklist
// If a task depends on the completion of other tasks, we want to check if all dependencies are finished:
//    ^ If all the dependencies are done ( true ), then the task is enabled
//    ^ If at least one of the dependencies is unfinished ( false ), then we check the proceeding conditions
// If a task is set to keepActive, we keep it enabled. It allows a task to be revisited when completed
// If a task is completed, we disable it
export function isTaskDisabled( task: Task ) {
	if ( hasIncompleteDependencies( task ) ) {
		return true;
	}

	if ( task.keepActive ) {
		return false;
	}

	return task.isCompleted;
}

export function hasIncompleteDependencies( task: Task ) {
	return task?.dependencies?.some( ( dependency: boolean ) => dependency === false );
}
