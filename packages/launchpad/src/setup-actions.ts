import { isMobile } from '@automattic/viewport';
import { addQueryArgs } from '@wordpress/url';
import type { LaunchpadTaskActionsProps, Task } from './types';

export const setUpActionsForTasks = ( {
	siteSlug,
	tasks,
	tracksData,
	extraActions,
	uiContext = 'calypso',
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
		let logMissingCalypsoPath = false;

		if ( uiContext === 'calypso' && task.calypso_path !== undefined ) {
			let targetPath = task.calypso_path;

			if ( task.id === 'drive_traffic' && ! isMobile() ) {
				targetPath = addQueryArgs( targetPath, { tour: 'marketingConnectionsTour' } );
			}

			action = () => {
				window.location.assign( targetPath );
			};
		} else {
			switch ( task.id ) {
				case 'share_site':
					action = () => {
						setShareSiteModalIsOpen?.( true );
					};
					break;

				case 'site_title':
					logMissingCalypsoPath = true;
					action = () => {
						window.location.assign( `/settings/general/${ siteSlug }` );
					};
					break;

				case 'domain_claim':
				case 'domain_upsell':
				case 'domain_customize':
					logMissingCalypsoPath = true;
					action = () => {
						window.location.assign( `/domains/add/${ siteSlug }` );
					};
					break;
				case 'drive_traffic':
					logMissingCalypsoPath = true;
					action = () => {
						const url = isMobile()
							? `/marketing/connections/${ siteSlug }`
							: `/marketing/connections/${ siteSlug }?tour=marketingConnectionsTour`;
						window.location.assign( url );
					};
					break;
				case 'add_new_page':
					logMissingCalypsoPath = true;
					action = () => {
						window.location.assign( `/page/${ siteSlug }` );
					};
					break;
				case 'edit_page':
					logMissingCalypsoPath = true;
					action = () => {
						window.location.assign( `/pages/${ siteSlug }` );
					};
					break;
				case 'update_about_page':
					logMissingCalypsoPath = true;
					action = () => {
						window.location.assign( `/page/${ siteSlug }/${ task?.extra_data?.about_page_id }` );
					};
					break;
				case 'customize_welcome_message':
					logMissingCalypsoPath = true;
					action = () => {
						window.location.assign( `/settings/reading/${ siteSlug }#newsletter-settings` );
					};
					break;
				case 'manage_subscribers':
					logMissingCalypsoPath = true;
					action = () => {
						window.location.assign( `/subscribers/${ siteSlug }` );
					};
					break;
				default:
					logMissingCalypsoPath = true;
					break;
			}
		}

		if ( logMissingCalypsoPath ) {
			recordTracksEvent( 'calypso_launchpad_task_missing_calypso_path', {
				checklist_slug: checklistSlug,
				task_id: task.id,
				is_completed: task.completed,
				context: launchpadContext,
			} );
		}

		const actionDispatch = () => {
			recordTaskClickTracksEvent( task );
			action?.();
		};

		return { ...task, actionDispatch };
	} );
};
