import { tryToGuessPostalCodeFormat } from '@automattic/wpcom-checkout';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

export default function getPostalCode( contactDetails: ManagedContactDetails | undefined ): string {
	if ( ! contactDetails ) {
		return '';
	}
	const countryCode = contactDetails.countryCode?.value ?? '';
	const postalCode = contactDetails.postalCode?.value ?? '';
	return tryToGuessPostalCodeFormat( postalCode.toUpperCase(), countryCode );
}
