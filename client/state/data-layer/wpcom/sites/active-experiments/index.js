/**
 * Internal Dependencies
 */
import makeJsonSchemaParser from 'lib/make-json-schema-parser';
import schema from './schema.json';
import { EXPERIMENT_FETCH } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { assignToExperiments } from 'state/experiments/actions';

const transformApiRequest = data => {
	return {
		Abtests: data.variations,
		nextRefresh: data.ttl,
	};
};

export const fetchExperiments = action =>
	http(
		{
			apiNamespace: 'wpcom',
			method: 'GET',
			path: '/v2/experiments/calypso',
			query: {
				anonId: action.anonId,
			},
		},
		{ ...action }
	);

export const experimentUpdate = ( action, experiments ) => dispatch => {
	dispatch( assignToExperiments( experiments ) );
};

registerHandlers( 'state/data-layer/wpcom/sites/active-experiments/index.js', {
	[ EXPERIMENT_FETCH ]: [
		dispatchRequest( {
			fetch: fetchExperiments,
			onSuccess: experimentUpdate,
			fromApi: makeJsonSchemaParser( schema, transformApiRequest ),
		} ),
	],
} );
