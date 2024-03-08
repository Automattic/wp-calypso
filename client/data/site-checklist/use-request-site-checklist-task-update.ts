import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { requestSiteChecklistTaskUpdate } from 'calypso/state/checklist/actions';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import useSiteChecklistTask from './use-site-checklist-task';

/**
 * Request a update for the specified task
 * @param siteId The site ID
 * @param taskId The task ID you want to update
 */
const useRequestSiteChecklistTaskUpdate = (
	siteId: string,
	taskId: ( typeof CHECKLIST_KNOWN_TASKS )[ keyof typeof CHECKLIST_KNOWN_TASKS ]
): void => {
	const dispatch = useDispatch();
	const task = useSiteChecklistTask( siteId, taskId );

	useEffect( () => {
		if ( task && ! task.isCompleted ) {
			dispatch( requestSiteChecklistTaskUpdate( siteId, task.id ) );
		}
	}, [ siteId, task, dispatch ] );
};

export default useRequestSiteChecklistTaskUpdate;
