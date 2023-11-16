import { translate } from 'i18n-calypso';

/* translators: Information about a recurring yearly payment made by a subscriber to a site owner.
				%(productName)s - the title of the purchase in the purchase history views,
				%(quantity)s - the amount of storage purchased in gigabytes
				GB - gigabytes */
export function getStorageAddOnDisplayName( productName: string, quantity: number | null ) {
	if ( quantity ) {
		return translate( '%(productName)s %(quantity)s GB', {
			args: {
				productName,
				quantity,
			},
		} );
	}

	return productName;
}
