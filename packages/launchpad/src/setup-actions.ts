import { isMobile } from '@automattic/viewport';
import type { LaunchpadTaskActionsProps, Task } from './types';

export const setUpActionsForTasks = ( {
	siteSlug,
	tasks,
	tracksData,
	extraActions,
}: LaunchpadTaskActionsProps ): Task[] => {
	const { recordTracksEvent, checklistSlug, tasklistCompleted, launchpadContext } = tracksData;
	const { setShareSiteModalIsOpen } = extraActions || {};

	//Record click events for tasks
	const recordTaskClickTracksEvent = ( task: Task ) => {
		recordTracksEvent( 'calypso_launchpad_task_clicked', {
			checklist_slug: checklistSlug,
			checklist_completed: tasklistCompleted,
			task_id: task.id,
			is_completed: task.completed,
			context: launchpadContext,
		} );
	};

	// Sort task by completion status.
	const completedTasks = tasks.filter( ( task: Task ) => task.completed );
	const incompleteTasks = tasks.filter( ( task: Task ) => ! task.completed );
	const sortedTasks = [ ...completedTasks, ...incompleteTasks ];

	// Add actions to sorted tasks.
	return sortedTasks.map( ( task: Task ) => {
		let action: () => void;

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
			case 'share_site':
				action = () => {
					setShareSiteModalIsOpen?.( true );
				};
				break;
			case 'update_about_page':
				action = () => {
					window.location.assign( `/page/${ siteSlug }/${ task?.extra_data?.about_page_id }` );
				};
				break;
			case 'customize_welcome_message':
				action = () => {
					window.location.assign( `/settings/reading/${ siteSlug }#newsletter-settings` );
				};
				break;
			case 'manage_subscribers':
				action = () => {
					window.location.assign( `/subscribers/${ siteSlug }` );
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
