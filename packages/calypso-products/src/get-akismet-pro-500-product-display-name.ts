import { translate } from 'i18n-calypso';

export function getAkismetPro500ProductDisplayName( productName: string, quantity: number | null ) {
	if ( quantity && quantity > 1 ) {
		/* translators: %s is the product name "Akismet Pro", %d is a number of requests/month */
		return translate( '%(productName)s (%(requests)d requests/month)', {
			args: {
				productName: productName.replace( /\s*\(.*$/, '' ).trim(),
				requests: 500 * quantity,
			},
			textOnly: true,
		} );
	}

	return productName;
}
