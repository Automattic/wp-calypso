import type { Purchase } from '@automattic/api-core';

/**
 * Always use the remove intent so Delete redirect ends the redirect immediately
 * (refund or purchase removal), rather than only disabling auto-renew.
 */
export function getDeleteSiteRedirectIntent( purchase: Purchase ): 'remove' | null {
	if ( purchase.is_cancelable || purchase.is_removable ) {
		return 'remove';
	}

	return null;
}
