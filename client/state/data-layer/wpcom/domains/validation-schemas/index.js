/** @format */
/**
 * External dependencies
 */
import { get, join, flatMap } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_REQUEST } from 'state/action-types';
import { addValidationSchemas } from 'state/domains/management/validation-schemas/actions';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'state/analytics/actions';

/**
 * Convert an application level request action for domain contact information
 * validation schemas into an HTTP request actions for the data-layer
 *
 * @param 	{Object}        action      the schemas request action
 * @param   {Array<String>} action.tlds the tlds to be fetched from the API
 * @returns {Object}                    The HTTP action for the data
 */
export const fetch = action =>
	http(
		{
			apiVersion: '1',
			method: 'GET',
			path: `/domains/validation-schemas/${ join( get( action, 'tlds', [] ), ',' ) }`,
		},
		action
	);

/**
 * Pop a HTTP request result into (an action to put it into) the state
 *
 * @param   {Object} action   Originating action (unused).
 * @param   {Object} schemas  Request result shaped like { tld: schema }
 * @returns {Object}          An action to add the schema(s) to the state
 */
export const onSuccess = ( action, schemas ) => addValidationSchemas( schemas );

/**
 * Create an error notice action when the request fails
 *
 * @param   {Object} tlds   Originating action with the original list of requested tlds
 * @param   {Object} error  Error information (query path, error message etc).
 * @returns {[Action]}      An array of mc and tracks analytics events, one each per tld
 */
export const onError = ( { tlds }, error ) =>
	composeAnalytics(
		...flatMap( tlds, tld => [
			bumpStat( 'form_validation_schema_exceptions', `load_${ tld }` ),
			recordTracksEvent( 'calypso_domain_contact_validation_schema_load_failure', {
				tld,
				error: JSON.stringify( error ),
			} ),
		] )
	);

export default {
	[ DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_REQUEST ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
};
