/** @format */

/**
 * External dependencies
 */
import { isEnabled } from 'config';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { SITE_CHECKLIST_REQUEST, SITE_CHECKLIST_TASK_UPDATE } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveSiteChecklist } from 'state/checklist/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetchChecklist = action =>
	http(
		{
			path: `/sites/${ action.siteId }/checklist`,
			method: 'GET',
			apiNamespace: isEnabled( 'onboarding-checklist/phase2' ) ? 'rest/v1.1' : 'rest/v1',
			query: {
				http_envelope: 1,
			},
		},
		action
	);

export const receiveChecklistSuccess = ( action, checklist ) =>
	receiveSiteChecklist( action.siteId, checklist );

const dispatchChecklistRequest = dispatchRequest( {
	fetch: fetchChecklist,
	onSuccess: receiveChecklistSuccess,
	onError: noop,
} );

export const updateChecklistTask = action =>
	http(
		{
			path: `/sites/${ action.siteId }/checklist`,
			method: 'POST',
			apiNamespace: 'rest/v1',
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
} );

registerHandlers( 'state/data-layer/wpcom/checklist/index.js', {
	[ SITE_CHECKLIST_REQUEST ]: [ dispatchChecklistRequest ],
	[ SITE_CHECKLIST_TASK_UPDATE ]: [ dispatchChecklistTaskUpdate ],
} );
