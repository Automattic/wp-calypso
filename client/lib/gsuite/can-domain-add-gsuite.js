/**
 * External dependencies
 */
import { endsWith } from 'lodash';

/**
 * Internal dependencies
 */
import { canUserPurchaseGSuite } from './can-user-purchase-gsuite';

/**
 * Determines whether G Suite is allowed for the specified domain.
 *
 * @param {string} domainName - domain name
 * @returns {boolean} - true if G Suite is allowed, false otherwise
 */
export function canDomainAddGSuite( domainName ) {
	if ( endsWith( domainName, '.wpcomstaging.com' ) ) {
		return false;
	}

	return canUserPurchaseGSuite();
}
