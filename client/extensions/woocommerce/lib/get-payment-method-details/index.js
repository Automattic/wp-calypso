/**
 * Internal dependencies
 */

import detailsMappings from './details-mappings';

/**
 * Gets additional gateway details
 *
 * @param {string} methodId Payment method id.
 * @returns {object} Method additional details.
 */
export default function getPaymentMethodDetails( methodId ) {
	return detailsMappings[ methodId ] || {};
}
