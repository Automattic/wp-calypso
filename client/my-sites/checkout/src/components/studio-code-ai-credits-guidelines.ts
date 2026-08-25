import { PRODUCT_STUDIO_CODE_AI_CREDITS } from '@automattic/api-core';
import type { ResponseCart } from '@automattic/shopping-cart';

// The guidelines doc is published in English only, so this skips localizeUrl().
const AI_CREDITS_GUIDELINES_URL =
	'https://developer.wordpress.com/docs/developer-tools/studio/studio-code/ai-credits-guidelines/';

export function getStudioCodeAiCreditsGuidelinesUrl() {
	return AI_CREDITS_GUIDELINES_URL;
}

export function hasStudioCodeAiCredits( cart: ResponseCart ) {
	return cart.products.some(
		( product ) => PRODUCT_STUDIO_CODE_AI_CREDITS === product.product_slug
	);
}
