import { Task } from '@automattic/launchpad';
import { useEffect } from 'react';
import useSiteChecklist from 'calypso/data/site-checklist/use-site-checklist';
import { useDispatch } from 'calypso/state';
import { requestSiteChecklistTaskUpdate } from 'calypso/state/checklist/actions';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';

/**
 * Hook to automatically complete site checklist tasks that aren't part of the launchpad checklist
 */
export const useCompleteNonLaunchpadTasks = (
	siteId: number,
	launchpadChecklist: Task[] | undefined
) => {
	const dispatch = useDispatch();
	const siteChecklist = useSiteChecklist( siteId.toString() );

	useEffect( () => {
		// Guard against missing data
		if ( ! launchpadChecklist?.length || ! siteChecklist?.tasks?.length ) {
			return;
		}

		const launchpadTaskIds = new Set( launchpadChecklist.map( ( task ) => task.id ) );
		const knownTaskIds = new Set( Object.values( CHECKLIST_KNOWN_TASKS ) );

		const tasksToComplete = siteChecklist.tasks.filter(
			( task ) =>
				knownTaskIds.has( task.id ) && // Only known tasks
				! task.isCompleted && // Not already completed
				! launchpadTaskIds.has( task.id ) // Not in launchpad checklist
		);

		tasksToComplete.forEach( ( task ) => {
			dispatch( requestSiteChecklistTaskUpdate( siteId.toString(), task.id ) );
		} );
	}, [ dispatch, siteId, launchpadChecklist, siteChecklist ] );
};
