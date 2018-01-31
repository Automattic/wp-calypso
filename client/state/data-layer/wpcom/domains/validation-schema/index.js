/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get, forEach } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_REQUEST } from 'state/action-types';
import { addValidationSchema } from 'state/domains/management/validation-schemas/actions';
import { errorNotice } from 'state/notices/actions';

/**
 * Request domain contact information validation schemas from the WordPress.com API
 *
 * @param   {Function} dispatch Redux dispatcher (from the the Redux store)
 * @param 	{String} action The action to dispatch next
 */
export const fetchValidationSchema = ( { dispatch }, action ) => {
	const tlds = get( action, 'tlds', [] );
	forEach( tlds, tld =>
		dispatch(
			http(
				{
					apiVersion: '1',
					method: 'GET',
					path: `/domains/validation-schema/${ tld }`,
				},
				action
			)
		)
	);
};

/**
 * Dispatches actions to add validation schemas to the store (one for each schema)
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @param   {Object}   schemas  object of { tld: schema } pairs
 */
export const addValidationSchemas = ( { dispatch }, action, schemas ) => {
	forEach( schemas, ( schema, tld ) => {
		dispatch( addValidationSchema( { [ tld ]: schema } ) );
	} );
};

/**
 * Dispatches an error notice action when the request for the validation schemas fails.
 *
 * @param   {Function} dispatch Redux dispatcher
 * @returns {Object}            dispatched error notice action
 */
export const validationSchemaFailure = ( { dispatch } ) =>
	dispatch(
		errorNotice(
			translate( "We couldn't load the data for validating ccTLD specific requirements." )
		)
	);

export default {
	[ DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_REQUEST ]: [
		dispatchRequest( fetchValidationSchema, addValidationSchemas, validationSchemaFailure ),
	],
};
