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

// A list of known tasks for the calypso client/my-sites/customer-home/cards/tasks/site-setup-list/get-task.js
const knownTaskIds = [
	'site_created',
	'domain_verified',
	'email_verified',
	'blogname_set',
	'mobile_app_installed',
	'site_launched',
	'front_page_updated',
	'site_menu_updated',
];

// Transform the response to a data / schema calypso understands, eg filter out unknown tasks
const fromApi = ( payload ) => {
	// The checklist API requests use the http_envelope query param, however on
	// desktop the envelope is not being unpacked for some reason. This conversion
	// ensures the payload has been unpacked.
	const data = get( payload, 'body', payload );

	if ( ! data ) {
		throw new TypeError( `Missing 'body' property on API response` );
	}
	if ( ! Array.isArray( data.tasks ) ) {
		throw new TypeError( `API response needs array of tasks: found ${ typeof data.tasks }` );
	}
	return {
		designType: data.designType,
		phase2: data.phase2,
		segment: data.segment,
		verticals: data.verticals,
		tasks: data.tasks.filter( ( task ) => knownTaskIds.includes( task.id ) ),
	};
};

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
	return receiveSiteChecklist( action.siteId, receivedChecklist );
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
