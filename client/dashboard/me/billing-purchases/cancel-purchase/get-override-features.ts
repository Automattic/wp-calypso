import { getProductCategory } from './get-confirmation-copy';
import type { PurchaseForCopy } from './get-confirmation-copy';
import type { CancellationFeature } from '@automattic/api-core';

/**
 * Client-side override for cancellation features. When the split-cancel-remove
 * flag is on, this replaces the server-provided feature list with
 * benefit-oriented copy keyed by product slug and category.
 *
 * Returns null when no override exists — caller falls back to API features.
 */
export function getOverrideCancellationFeatures(
	purchase: PurchaseForCopy
): CancellationFeature[] | null {
	const slug = purchase.product_slug;
	const category = getProductCategory( purchase );

	switch ( category ) {
		case 'plan':
			return getWpcomPlanFeatures( slug );
		case 'domain':
			return getDomainFeatures( purchase );
		case 'email':
			return getEmailFeatures( slug );
		case 'jetpack':
			return getJetpackFeatures( slug );
		case 'akismet':
			return getAkismetFeatures();
		case 'marketplace':
			return getMarketplaceFeatures( purchase );
		case 'one-time':
		case 'other':
			return getAddonFeatures( slug );
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getWpcomPlanFeatures( slug: string ): CancellationFeature[] | null {
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDomainFeatures( purchase: PurchaseForCopy ): CancellationFeature[] | null {
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getEmailFeatures( slug: string ): CancellationFeature[] | null {
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getJetpackFeatures( slug: string ): CancellationFeature[] | null {
	return null;
}

function getAkismetFeatures(): CancellationFeature[] | null {
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getMarketplaceFeatures( purchase: PurchaseForCopy ): CancellationFeature[] | null {
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAddonFeatures( slug: string ): CancellationFeature[] | null {
	return null;
}
