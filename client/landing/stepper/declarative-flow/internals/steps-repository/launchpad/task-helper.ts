import { translate } from 'i18n-calypso';
import { SiteDetails } from 'calypso/../packages/data-stores/src';
import { launchpadFlowTasks } from './tasks';
import { Task } from './types';

export function getEnhancedTasks(
	tasks: Task[],
	siteSlug: string | null,
	site: SiteDetails | null
) {
	const enhancedTaskList: Task[] = [];
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
						badgeText: site?.plan?.product_name_short || '',
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
					};
					break;
				case 'link_in_bio_launched':
					taskData = {
						title: translate( 'Launch Link in bio' ),
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
