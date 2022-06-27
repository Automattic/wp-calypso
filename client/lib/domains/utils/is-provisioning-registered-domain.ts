import { isRegisteredDomain } from 'calypso/lib/domains';
import { isRecentlyRegistered } from 'calypso/lib/domains/utils';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * When users have registered a domain with us, we want to know if it looks like it is currently
 * waiting for the DNS records to propagate.
 *
 * @param domain Domain object
 * @param minutesSinceRegistration Allowed time to have passed since domain registration in minutes
 */
export function isProvisioningRegisteredDomain(
	domain?: ResponseDomain,
	minutesSinceRegistration = 15
): boolean {
	if (
		domain &&
		isRegisteredDomain( domain ) &&
		! domain.hasWpcomNameservers &&
		isRecentlyRegistered( domain.registrationDate, minutesSinceRegistration )
	) {
		return true;
	}

	return false;
}
