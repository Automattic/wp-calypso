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
				case 'manage_subscribers':
					action = () => {
						window.location.assign( `/subscribers/${ siteSlug }` );
					};
					break;
			}
		}

		const actionDispatch = () => {
			recordTaskClickTracksEvent( task );
			action?.();
		};

		return { ...task, actionDispatch };
	} );
};
