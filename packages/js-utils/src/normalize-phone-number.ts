import { countries } from './phone-number-data';

/** Normalizes business phones without mobile-number or assignment validation. */
export default function normalizePhoneNumber( value: string, countryCode = '' ): string | null {
	const input = value.trim();
	if ( ! input ) {
		return '';
	}

	const match = /^(\+?[\d\s().-]+?)(?:\s*ext\s*(\d+))?$/i.exec( input );
	if ( ! match ) {
		return null;
	}

	const [ , main, extension ] = match;
	let digits = main.replace( /[\s().-]/g, '' );
	if ( ! digits.startsWith( '+' ) ) {
		const country = (
			countries as Record< string, { dialCode: string; nationalPrefix?: string } >
		 )[ countryCode.toUpperCase() ];
		if ( ! country ) {
			return null;
		}

		const prefix = country.nationalPrefix;
		if ( prefix && digits.startsWith( prefix ) ) {
			digits = digits.slice( prefix.length );
		}
		digits = '+' + country.dialCode + digits;
	}

	if ( ! /^\+[1-9]\d{3,14}$/.test( digits ) ) {
		return null;
	}

	return digits + ( extension ? ` ext ${ extension }` : '' );
}
