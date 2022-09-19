import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { getGSuiteProductSlug, getGSuiteSubscriptionStatus } from 'calypso/lib/gsuite';
import { getTitanProductSlug } from 'calypso/lib/titan';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Determines whether a domain has email provider and is everything set up to add new mailboxes
 */
export function canAddMailboxesToEmailSubscription( domain?: ResponseDomain ): boolean {
	const domainIsNotProvisioning = getGSuiteProductSlug( domain ) || getTitanProductSlug( domain );
	const isAwaitingGoogleTosAcceptance = getGSuiteSubscriptionStatus( domain ) === 'suspended';

	return (
		( domainIsNotProvisioning || hasEmailForwards( domain ) ) &&
		! isAwaitingGoogleTosAcceptance &&
		canCurrentUserAddEmail( domain )
	);
}
