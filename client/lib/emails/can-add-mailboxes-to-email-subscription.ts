import { canCurrentUserAddEmail } from 'calypso/lib/domains';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { getGSuiteProductSlug, getGSuiteSubscriptionStatus } from 'calypso/lib/gsuite';
import { getTitanProductSlug } from 'calypso/lib/titan';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Determines if a domain has a provisioned email subscription and if the current user can add new mailboxes.
 */
export function canAddMailboxesToEmailSubscription( domain?: ResponseDomain ): boolean {
	const emailSubscriptionIsProvisioned = Boolean(
		getGSuiteProductSlug( domain ) || getTitanProductSlug( domain ) || hasEmailForwards( domain )
	);
	const isAwaitingGoogleTosAcceptance = getGSuiteSubscriptionStatus( domain ) === 'suspended';

	return (
		emailSubscriptionIsProvisioned &&
		! isAwaitingGoogleTosAcceptance &&
		canCurrentUserAddEmail( domain )
	);
}
