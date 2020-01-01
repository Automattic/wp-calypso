/**
 * Internal dependencies
 */

import detailsMappings from './details-mappings';

/**
 * Gets additional gateway details
 *
 * @param {String} methodId Payment method id.
 * @return {object} Method additional details.
 */
export default function getPaymentMethodDetails( methodId ) {
	return detailsMappings[ methodId ] || {};
}
