/**
 * External dependencies
 */

import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { SITE_CHECKLIST_REQUEST } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveSiteChecklist } from 'state/checklist/actions';

export const fetchChecklist = ( { dispatch }, action ) => {
	dispatch(
		http(
			{
				path: `/sites/${ action.siteId }/checklist`,
				method: 'GET',
				apiNamespace: 'rest/v1',
			},
			action
		)
	);
};

export const receiveSuccess = ( { dispatch }, action, checklist ) => {
	dispatch(
		receiveSiteChecklist(
			action.siteId,
			checklist
		)
	);
};

const dispatchChecklistRequest = dispatchRequest( fetchChecklist, receiveSuccess, noop );

export default {
	[ SITE_CHECKLIST_REQUEST ]: [ dispatchChecklistRequest ],
};
