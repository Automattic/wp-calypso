import type { Purchase } from '@automattic/api-core';

export function getDeleteSiteRedirectIntent( purchase: Purchase ): 'cancel' | 'remove' | null {
	if ( purchase.is_cancelable ) {
		return 'cancel';
	}

	if ( purchase.is_removable ) {
		return 'remove';
	}

	return null;
}
