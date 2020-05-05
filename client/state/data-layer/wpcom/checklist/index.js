/**
 * External dependencies
 */
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { SITE_CHECKLIST_REQUEST, SITE_CHECKLIST_TASK_UPDATE } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveSiteChecklist } from 'state/checklist/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

// The checklist API requests use the http_envelope query param, however on
// desktop the envelope is not being unpacked for some reason. This conversion
// ensures the payload has been unpacked.
const fromApi = ( payload ) => get( payload, 'body', payload );

export const fetchChecklist = ( action ) =>
	http(
		{
			path: `/sites/${ action.siteId }/checklist`,
			method: 'GET',
			apiNamespace: 'rest/v1.2',
			query: {
				http_envelope: 1,
				with_domain_verification: action.isSiteEligibleForFSE ? 1 : 0,
			},
		},
		action
	);

export const receiveChecklistSuccess = ( action, receivedChecklist ) => {
	let checklist = receivedChecklist;

	// Legacy object-based data format, let's convert it to the new array-based format and ultimately remove it.
	if ( ! Array.isArray( receivedChecklist.tasks ) ) {
		checklist = {
			...receivedChecklist,
			tasks: Object.keys( receivedChecklist.tasks ).map( ( taskId ) => {
				const { completed, ...rest } = receivedChecklist.tasks[ taskId ];
				return {
					id: taskId,
					isCompleted: completed,
					...rest,
				};
			} ),
		};
	}

	return receiveSiteChecklist( action.siteId, checklist );
};

const dispatchChecklistRequest = dispatchRequest( {
	fetch: fetchChecklist,
	onSuccess: receiveChecklistSuccess,
	onError: noop,
	fromApi,
} );

export const updateChecklistTask = ( action ) =>
	http(
		{
			path: `/sites/${ action.siteId }/checklist`,
			method: 'POST',
			apiNamespace: 'rest/v1.1',
			query: {
				http_envelope: 1,
			},
			body: { taskId: action.taskId },
		},
		action
	);

const dispatchChecklistTaskUpdate = dispatchRequest( {
	fetch: updateChecklistTask,
	onSuccess: receiveChecklistSuccess,
	onError: noop,
	fromApi,
} );

registerHandlers( 'state/data-layer/wpcom/checklist/index.js', {
	[ SITE_CHECKLIST_REQUEST ]: [ dispatchChecklistRequest ],
	[ SITE_CHECKLIST_TASK_UPDATE ]: [ dispatchChecklistTaskUpdate ],
} );
