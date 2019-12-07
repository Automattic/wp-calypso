/** @format */
/**
 * External dependencies
 */
import { castArray } from 'lodash';

/**
 * Internal dependencies
 */
import {
	DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_ADD,
	DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_REQUEST,
} from 'state/action-types';

import 'state/data-layer/wpcom/domains/validation-schemas/index.js';

/**
 * Action creator function: DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_ADD
 *
 * @param  {Object} schemas object of { tld: schemaObject } pairs
 * @return {Object} action
 */
export const addValidationSchemas = schemas => ( {
	type: DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_ADD,
	schemas,
} );

/**
 * Action creator to request tld validation schemas: DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_REQUEST
 *
 * @param  {String|Array<String>} tlds List of tlds that we're requesting schemas for
 * @return {Object} action
 */
export const requestValidationSchemas = tlds => ( {
	type: DOMAIN_MANAGEMENT_VALIDATION_SCHEMAS_REQUEST,
	tlds: castArray( tlds ),
} );
