import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Task } from '@automattic/launchpad';
import { type TaskContext } from './types';

/**
 * Build a function that tracks a task event.
 * @param event The event name to track.
 * @returns A function that tracks the event.
 * @example
 * const recordTaskClickTracksEvent = buildEventTracker( 'calypso_launchpad_task_clicked' );
 * recordTaskClickTracksEvent( task, flow, context );
 */
const buildEventTracker =
	( event: string ) =>
	( task: Task, flow: string, context: TaskContext, extraOptions = {} ) => {
		const { site, tasks } = context;

		recordTracksEvent( event, {
			checklist_completed: tasks.every( ( t ) => t.completed ),
			checklist_slug: site?.options?.site_intent,
			context: 'fullscreen',
			flow,
			is_completed: task.completed,
			order: task.order,
			site_intent: site?.options?.site_intent,
			task_id: task.id,
			...extraOptions,
		} );
	};

export const recordGlobalStylesGattingPlanSelectedResetStylesEvent = buildEventTracker(
	'calypso_launchpad_global_styles_gating_plan_selected_reset_styles'
);
