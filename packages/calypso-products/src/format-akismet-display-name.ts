import { translate } from 'i18n-calypso';

/**
 * Formats an Akismet product display name with its current monthly request
 * allotment, e.g. "Akismet Pro (8K requests/month)". Any stale parenthetical
 * suffix already present in the product name is stripped before the current
 * allotment is appended.
 * @param {string} productName - the product name (may carry a stale parenthetical)
 * @param {number} requestsInThousands - the monthly request allotment, in thousands
 * @returns {string} the formatted display name
 */
export function formatAkismetDisplayName(
	productName: string,
	requestsInThousands: number
): string {
	/* translators: %(productName)s is the product name (e.g. "Akismet Pro"); %(requestsK)d is the monthly request count in thousands, rendered as "NK" (e.g. "8K"). */
	return translate( '%(productName)s (%(requestsK)dK requests/month)', {
		args: {
			productName: productName.replace( /\s*\(.*$/, '' ).trim(),
			requestsK: requestsInThousands,
		},
		textOnly: true,
	} );
}
