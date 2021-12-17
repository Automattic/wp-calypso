import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import getSiteChecklist from 'calypso/state/selectors/get-site-checklist';
import { requestSiteChecklistTaskUpdate } from './actions';

/**
 * Request a update for the specified task
 *
 * @param siteId The site ID
 * @param taskId The task ID you want to update
 */
export const useRequestSiteChecklistTaskUpdate = (
	siteId: string,
	taskId: typeof CHECKLIST_KNOWN_TASKS[ keyof typeof CHECKLIST_KNOWN_TASKS ]
): void => {
	const dispatch = useDispatch();
	const task = useSelector( ( state ) =>
		getSiteChecklist( state, Number( siteId ) )?.tasks.find( ( { id } ) => id === taskId )
	);

	useEffect( () => {
		if ( task && ! task.isCompleted ) {
			dispatch( requestSiteChecklistTaskUpdate( siteId, task.id ) );
		}
	}, [ siteId, task, dispatch ] );
};
