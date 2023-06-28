import { translate } from 'i18n-calypso';

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
