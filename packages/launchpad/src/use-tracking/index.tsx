import { recordTracksEvent } from '@automattic/calypso-analytics';
import { SiteDetailsOptions } from '@automattic/data-stores';
import { useEffect, useMemo } from 'react';
import type { Task } from '../types';

interface LogParams {
	tasks: Task[];
	checklistSlug: string | null;
	context: string;
	siteIntent: SiteDetailsOptions[ 'site_intent' ];
	flow?: string;
}

export const useTracking = ( params: LogParams ) => {
	const { tasks, checklistSlug, context, siteIntent, flow } = params;
	const completedSteps = useMemo( () => tasks.filter( ( task ) => task.completed ), [ tasks ] );
	const taskNames = useMemo( () => tasks.map( ( task ) => task.id ).join( ',' ), [ tasks ] );
	const numberOfSteps = tasks.length;
	const numberOfCompletedSteps = completedSteps.length;
	const isCheckListCompleted = completedSteps.length === tasks.length;

	useEffect( () => {
		if ( tasks.length === 0 || ! siteIntent ) {
			return;
		}

		recordTracksEvent( 'calypso_launchpad_tasklist_viewed', {
			number_of_steps: numberOfSteps,
			number_of_completed_steps: numberOfCompletedSteps,
			is_completed: isCheckListCompleted,
			tasks: taskNames,
			checklist_slug: checklistSlug,
			context: context,
			site_intent: siteIntent,
			flow,
		} );

		tasks.forEach( ( task: Task ) => {
			recordTracksEvent( 'calypso_launchpad_task_view', {
				checklist_slug: checklistSlug,
				task_id: task.id,
				is_completed: task.completed,
				context: context,
				order: task.order,
				flow,
				site_intent: siteIntent,
			} );
		} );
		// Array of tasks requires deep comparison
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ JSON.stringify( tasks ), siteIntent ] );

	const trackClick = ( task: Task ) => {
		recordTracksEvent( 'calypso_launchpad_task_clicked', {
			number_of_steps: numberOfSteps,
			number_of_completed_steps: numberOfCompletedSteps,
			checklist_completed: isCheckListCompleted,
			is_completed: task.completed,
			checklist_slug: checklistSlug,
			context: context,
			site_intent: siteIntent,
			task_id: task.id,
			order: task.order,
			flow,
		} );
	};

	return {
		trackClick,
	};
};
