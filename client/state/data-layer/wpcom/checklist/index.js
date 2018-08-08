/** @format */

/**
 * Internal dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveSiteChecklist } from 'state/checklist/actions';
import { SITE_CHECKLIST_REQUEST, SITE_CHECKLIST_TASK_UPDATE } from 'state/action-types';

const fromApi = makeJsonSchemaParser(
	{
		type: 'object',
		additionalProperties: true,
		properties: {
			tasks: {
				type: 'object',
				patternProperties: {
					'.*': {
						type: 'object',
						additionalProperties: false,
						required: [ 'completed' ],
						properties: {
							completed: { type: [ 'boolean', 'null' ] },
							url: { type: 'string' },
						},
					},
				},
			},
		},
	},
	( { tasks } ) => tasks
);

const fetchChecklist = action =>
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

const receiveChecklistSuccess = ( action, checklist ) =>
	receiveSiteChecklist( action.siteId, checklist );

const dispatchChecklistRequest = dispatchRequestEx( {
	fetch: fetchChecklist,
	fromApi,
	onSuccess: receiveChecklistSuccess,
} );

const updateChecklistTask = action =>
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

const dispatchChecklistTaskUpdate = dispatchRequestEx( {
	fetch: updateChecklistTask,
	fromApi,
	onSuccess: receiveChecklistSuccess,
} );

export default {
	[ SITE_CHECKLIST_REQUEST ]: [ dispatchChecklistRequest ],
	[ SITE_CHECKLIST_TASK_UPDATE ]: [ dispatchChecklistTaskUpdate ],
};
