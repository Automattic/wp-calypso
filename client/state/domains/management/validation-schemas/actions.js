/** @format */

/**
 * Internal dependencies
 */
import {
	DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_ADD,
	DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_REQUEST,
} from 'state/action-types';

/**
 * Action creator function: DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_ADD
 *
 * @param  {Object} data   object of { tld: schema } pairs
 * @return {Object} action object
 */
export const addValidationSchema = data => ( {
	type: DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_ADD,
	data,
} );

/**
 * Action creator to request tld validation schemas: DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_REQUEST
 *
 * @param  {Array<String>} tlds List of tlds that we're requesting schemas for
 * @return {Object} action object
 */
export const requestValidationSchema = tlds => ( {
	type: DOMAIN_MANAGEMENT_VALIDATION_SCHEMA_REQUEST,
	data: tlds,
} );
