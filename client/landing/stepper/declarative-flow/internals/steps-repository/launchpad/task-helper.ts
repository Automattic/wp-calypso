import { translate } from 'i18n-calypso';
import { PLANS_LIST } from 'calypso/../packages/calypso-products/src/plans-list';
import { SiteDetails } from 'calypso/../packages/data-stores/src';
import { launchpadFlowTasks } from './tasks';
import { Task } from './types';

export function getEnhancedTasks(
	tasks: Task[],
	siteSlug: string | null,
	site: SiteDetails | null
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
						title: translate( 'Set up Newsletter' ),
					};
					break;
				case 'plan_selected':
					taskData = {
						title: translate( 'Choose a Plan' ),
						badgeText: translatedPlanName,
					};
					break;
				case 'subscribers_added':
					taskData = {
						title: translate( 'Add Subscribers' ),
					};
					break;
				case 'first_post_published':
					taskData = {
						title: translate( 'Write your first post' ),
						actionUrl: `/post/${ siteSlug }`,
					};
					break;
				case 'design_selected':
					taskData = {
						title: translate( 'Select a design' ),
					};
					break;
				case 'setup_link_in_bio':
					taskData = {
						title: translate( 'Setup Link in bio' ),
					};
					break;
				case 'links_added':
					taskData = {
						title: translate( 'Add links' ),
						actionUrl: `/site-editor/${ siteSlug }`,
						isCompleted: linkInBioLinksEditCompleted,
					};
					break;
				case 'link_in_bio_launched':
					taskData = {
						title: translate( 'Launch Link in bio' ),
						isCompleted: linkInBioSiteLaunchCompleted,
						dependencies: [ linkInBioLinksEditCompleted ],
					};
					break;
			}
			enhancedTaskList.push( { ...task, ...taskData } );
		} );
	return enhancedTaskList;
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
// If a task is completed, we disable it
// If a task is NOT completed AND the task contains dependencies, we want to check if all dependencies are set to true:
//    ^ If all the dependencies are true, then the task is enabled
//    ^ If at least one of the dependencies is false, then the task is disabled
export function isTaskDisabled( task: Task ) {
	if ( task.isCompleted ) {
		return task.isCompleted;
	}

	if ( task.dependencies ) {
		return task.dependencies.some( ( dependency: boolean ) => dependency === false );
	}
}
