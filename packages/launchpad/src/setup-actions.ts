import { isMobile } from '@automattic/viewport';
import { addQueryArgs } from '@wordpress/url';
import type { LaunchpadTracksData, Task } from './types';

export const setUpActionsForTasks = (
	tasks: Task[],
	siteSlug: string | null,
	tracksData: LaunchpadTracksData
): Task[] => {
	const { recordTracksEvent, checklistSlug, tasklistCompleted } = tracksData;

	//Record click events for tasks
	const recordTaskClickTracksEvent = ( task: Task ) => {
		recordTracksEvent( 'calypso_launchpad_task_clicked', {
			checklist_slug: checklistSlug,
			checklist_completed: tasklistCompleted,
			task_id: task.id,
			is_completed: task.completed,
			context: 'customer-home',
		} );
	};

	// Add actions to known tasks
	return tasks.map( ( task: Task ) => {
		let action: () => void;

		//Record task view tracks event
		recordTracksEvent( 'calypso_launchpad_task_view', {
			checklist_slug: checklistSlug,
			task_id: task.id,
			is_completed: task.completed,
			context: 'customer-home',
		} );

		switch ( task.id ) {
			case 'site_title':
				action = () => {
					window.location.assign( `/settings/general/${ siteSlug }` );
				};
				break;

			case 'domain_claim':
			case 'domain_upsell':
			case 'domain_customize':
				action = () => {
					window.location.assign( `/domains/add/${ siteSlug }` );
				};
				break;
			case 'drive_traffic':
				action = () => {
					const url = isMobile()
						? `/marketing/connections/${ siteSlug }`
						: `/marketing/connections/${ siteSlug }?tour=marketingConnectionsTour`;
					window.location.assign( url );
				};
				break;
			case 'add_new_page':
				action = () => {
					window.location.assign( `/page/${ siteSlug }` );
				};
				break;
			case 'edit_page':
				action = () => {
					window.location.assign( `/pages/${ siteSlug }` );
				};
				break;
		}

		const actionDispatch = () => {
			recordTaskClickTracksEvent( task );
			action?.();
		};

		return { ...task, actionDispatch };
	} );
};
