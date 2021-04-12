/**
 * Internal dependencies
 */
import { tryToGuessPostalCodeFormat } from 'calypso/lib/postal-code';
import type { ManagedContactDetails } from '../types/wpcom-store-state';

export default function getPostalCode( contactDetails: ManagedContactDetails | undefined ): string {
	if ( ! contactDetails ) {
		return '';
	}
	const countryCode = contactDetails.countryCode?.value ?? '';
	const postalCode = contactDetails.postalCode?.value ?? '';
	return tryToGuessPostalCodeFormat( postalCode.toUpperCase(), countryCode );
}
