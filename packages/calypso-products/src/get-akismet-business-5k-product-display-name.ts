import { translate } from 'i18n-calypso';

// The "5k" in this filename / function name is legacy naming retained for
// backend product-slug stability (ak_bus5k_*). The actual allotment is now
// 80000 requests/month, not 5K.
const AKISMET_BUSINESS_REQUESTS_PER_MONTH = 80000;

export function getAkismetBusiness5kProductDisplayName( productName: string ) {
	const requestsInThousands = AKISMET_BUSINESS_REQUESTS_PER_MONTH / 1000;

	/* translators: %(productName)s is the product name (e.g. "Akismet Business"); %(requestsK)d is the monthly request count in thousands, rendered as "NK" (e.g. "80K"). */
	return translate( '%(productName)s (%(requestsK)dK requests/month)', {
		args: {
			productName: productName.replace( /\s*\(.*$/, '' ).trim(),
			requestsK: requestsInThousands,
		},
		textOnly: true,
	} );
}
