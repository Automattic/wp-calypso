/**
 * Internal dependencies
 */
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';

export function hasPaidEmailWithUs( domain ) {
	return hasGSuiteWithUs( domain ) || hasTitanMailWithUs( domain );
}
