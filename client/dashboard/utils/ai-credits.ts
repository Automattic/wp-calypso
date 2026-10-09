import { AI_CREDITS_PRODUCT_SLUGS } from '@automattic/api-core';
import { formatNumber } from '@automattic/number-formatters';
import { _n, sprintf } from '@wordpress/i18n';

/**
 * Whether the product slug is one of the AI credits products (Studio Code AI Credits or AI Credits).
 */
export function isAiCreditsProductSlug( productSlug: string | undefined | null ): boolean {
	return !! productSlug && AI_CREDITS_PRODUCT_SLUGS.includes( productSlug );
}

/**
 * Return the AI credits product title with its credit count.
 */
export function getAiCreditsTitle( productName: string, quantity: number ): string {
	// The full name is "AI credits", but since that is also in the product name, we just say
	// "credits" here to avoid repetition on the same line
	return sprintf(
		// translators: productName is the name of the product and quantity is a number of credits
		_n(
			'%(productName)s (%(quantity)s credit)',
			'%(productName)s (%(quantity)s credits)',
			quantity
		),
		{ productName, quantity: formatNumber( quantity ) }
	);
}
