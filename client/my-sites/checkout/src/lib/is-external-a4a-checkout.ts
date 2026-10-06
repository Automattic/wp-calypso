import { isAllowedA4ADashboardHostname } from 'calypso/dashboard/app-a4a/routing';
import type { SitelessCheckoutType } from '@automattic/wpcom-checkout';

/**
 * Whether the checkout runs on a host that does not serve the pending page, so
 * the pending page has to be reached on WordPress.com. That is every Automattic
 * for Agencies checkout except the one served from the agency dashboard's own
 * address, which serves `/checkout/*` itself.
 */
export function isExternalA4ACheckout(
	sitelessCheckoutType: SitelessCheckoutType,
	hostname: string | undefined = typeof window !== 'undefined'
		? window.location.hostname
		: undefined
): boolean {
	return sitelessCheckoutType === 'a4a' && ! isAllowedA4ADashboardHostname( hostname );
}
