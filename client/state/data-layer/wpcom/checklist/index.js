/**
 * External dependencies
 */

import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { SITE_CHECKLIST_REQUEST } from 'state/action-types';
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

export const receiveSuccess = ( action, checklist ) =>
	receiveSiteChecklist(
			action.siteId,
			checklist
	);

const dispatchChecklistRequest = dispatchRequestEx( {
	fetch: fetchChecklist,
	onSuccess: receiveSuccess,
	onError: noop,
} );

export default {
	[ SITE_CHECKLIST_REQUEST ]: [ dispatchChecklistRequest ],
};
