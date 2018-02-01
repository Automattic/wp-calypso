/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get, map } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_REQUEST } from 'state/action-types';
import { addValidationSchema } from 'state/domains/management/validation-schemas/actions';
import { errorNotice } from 'state/notices/actions';

/**
 * Convert an application level request action for domain contact information
 * validation schemas into an HTTP request actions for the data-layer
 *
 * @param 	{Object}        action      the schema request action
 * @param   {Array<String>} action.tlds the tlds to be fetched from the API
 * @returns {Object}                    The HTTP action for the data
 */
export const fetch = action =>
	map( get( action, 'tlds', [] ), tld =>
		http(
			{
				apiVersion: '1',
				method: 'GET',
				path: `/domains/validation-schema/${ tld }`,
			},
			action
		)
	);

/**
 * Pop a HTTP request result into (an action to put it into) the state
 *
 * @param   {Object} action   Originating action (unused).
 * @param   {Object} schemas  Request result shaped like { tld: schema }
 * @returns {Object}          An action to add the schema to the state
 */
export const onSuccess = ( action, schemas ) =>
	map( schemas, ( schema, tld ) => addValidationSchema( { [ tld ]: schema } ) );

/**
 * Create an error notice action when the request fails
 *
 * @param   {Object} action   Originating action (unused).
 * @param   {Object} error    Error information (unused).
 * @returns {Object}          error notice action
 */
export const onError = () =>
	errorNotice(
		translate( "We couldn't load the data for validating ccTLD specific requirements." )
	);

export default {
	[ DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_REQUEST ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
};
