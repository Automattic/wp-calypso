import { translate } from 'i18n-calypso';

// The "500" in this filename / function name is legacy naming retained for
// backend product-slug stability (ak_pro5h_*). The actual per-quantity allotment
// is now 8000 requests/month, not 500.
const AKISMET_PRO_REQUESTS_PER_QUANTITY = 8000;

export function getAkismetPro500ProductDisplayName( productName: string, quantity: number | null ) {
	if ( ! quantity || quantity < 1 ) {
		return productName;
	}

	const requestsInThousands = ( AKISMET_PRO_REQUESTS_PER_QUANTITY * quantity ) / 1000;

	/* translators: %(productName)s is the product name (e.g. "Akismet Pro"); %(requestsK)d is the monthly request count in thousands, rendered as "NK" (e.g. "8K"). */
	return translate( '%(productName)s (%(requestsK)dK requests/month)', {
		args: {
			productName: productName.replace( /\s*\(.*$/, '' ).trim(),
			requestsK: requestsInThousands,
		},
		textOnly: true,
	} );
}
