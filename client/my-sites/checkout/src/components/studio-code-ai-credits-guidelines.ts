import { PRODUCT_STUDIO_CODE_AI_CREDITS } from '@automattic/api-core';
import { localizeUrl } from '@automattic/i18n-utils';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * TODO: SHILL-2355 - return the real URL once Legal publishes the AI Credits Guidelines doc.
 * Until then the anchor hangs off the Terms of Service page, so following the link lands
 * somewhere sensible instead of nowhere.
 */
export function getStudioCodeAiCreditsGuidelinesUrl() {
	return `${ localizeUrl( 'https://wordpress.com/tos/' ) }#ai-credits-guidelines-pending`;
}

export function hasStudioCodeAiCredits( cart: ResponseCart ) {
	return cart.products.some(
		( product ) => PRODUCT_STUDIO_CODE_AI_CREDITS === product.product_slug
	);
}
