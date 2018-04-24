/** @format */

/**
 * External dependencies
 */
import humps from 'lodash-humps';

/**
 * Internal dependencies
 */
import { extendAction } from 'state/utils';

const doBypassDataLayer = {
	meta: {
		dataLayer: {
			doBypass: true,
		},
	},
};

export const bypassDataLayer = action => extendAction( action, doBypassDataLayer );

/**
 * Deeply converts keys from the specified object to camelCase notation.
 *
 * @param {Object} - object to convert
 * @returns a new object with all keys converted
 */
export { humps as convertToCamelCase };
