import { formatNumber } from '@automattic/number-formatters';
import { _n, sprintf } from '@wordpress/i18n';

/**
 * Return the Studio Code AI Credits title with its credit count.
 */
export function getStudioCodeAiCreditsTitle( productName: string, quantity: number ): string {
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
