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
import config from 'config';

/**
 * Transform the result from the API into the action we can use
 *
 * @param data The result from the API
 * @returns {{variations: object, nextRefresh: number}} The transformed result
 */
const transformApiRequest = ( data ) => ( {
	variations: data.variations,
	nextRefresh: Date.now() + data.ttl * 1000,
} );

/**
 * Performs the http request
 *
 * @param action The EXPERIMENT_FETCH action
 * @returns object The http request action
 */
export const fetchExperiments = ( action ) =>
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

/**
 * Fires the action to update the state
 *
 * @param action The EXPERIMENT_FETCH action
 * @param experiments The result from 'transformApiRequest'
 * @returns function Dispatches the EXPERIMENT_ASSIGN action
 */
export const experimentUpdate = ( action, experiments ) => assignToExperiments( experiments );

/**
 * If the configuration is enabled, call the API to get assignment from the API
 */
if ( config.isEnabled( 'ive/use-external-assignment' ) ) {
	registerHandlers( 'state/data-layer/wpcom/experiments/index.js', {
		[ EXPERIMENT_FETCH ]: [
			dispatchRequest( {
				fetch: fetchExperiments,
				onSuccess: experimentUpdate,
				fromApi: makeJsonSchemaParser( schema, transformApiRequest ),
			} ),
		],
	} );
}
