/**
 * External dependencies
 */

import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { SITE_CHECKLIST_REQUEST, SITE_CHECKLIST_TASK_UPDATE } from 'state/action-types';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveSiteChecklist } from 'state/checklist/actions';

export const fetchChecklist = action =>
	http(
		{
			path: `/sites/${ action.siteId }/checklist`,
			method: 'GET',
			apiNamespace: 'rest/v1',
			query: {
				http_envelope: 1,
			},
		},
		action
	);

export const receiveChecklistSuccess = ( action, checklist ) =>
	receiveSiteChecklist(
			action.siteId,
			checklist
	);

const dispatchChecklistRequest = dispatchRequestEx( {
	fetch: fetchChecklist,
	onSuccess: receiveChecklistSuccess,
	onError: noop,
} );

export const updateChecklistTask = ( { siteId, taskId } ) =>
	http(
		{
			path: `/sites/${ siteId }/checklist`,
			method: 'POST',
			apiNamespace: 'rest/v1',
			query: {
				http_envelope: 1,
			},
			body: { taskId },
		}
	);

const dispatchChecklistTaskUpdate = dispatchRequestEx( {
	fetch: updateChecklistTask,
	onSuccess: receiveChecklistSuccess,
	onError: noop,
} );

export default {
	[ SITE_CHECKLIST_REQUEST ]: [ dispatchChecklistRequest ],
	[ SITE_CHECKLIST_TASK_UPDATE ]: [ dispatchChecklistTaskUpdate ],
};
