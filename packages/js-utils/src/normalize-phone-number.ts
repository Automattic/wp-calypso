import { countries } from './phone-number-data';

type PhoneCountry = {
	isoCode: string;
	dialCode: string;
	nationalPrefix?: string;
	priority?: number;
};

export function getNationalPhoneNumber( value: string, countryCode = '' ) {
	const normalized = value.trim().startsWith( '+' ) ? normalizePhoneNumber( value ) : null;
	if ( ! normalized ) {
		return { phoneNumber: value, countryCode };
	}

	const [ number, extension ] = normalized.split( ' ext ' );
	const matchingCountries = ( Object.values( countries ) as PhoneCountry[] )
		.filter( ( country ) => number.startsWith( '+' + country.dialCode ) )
		.sort(
			( first, second ) =>
				second.dialCode.length - first.dialCode.length ||
				Number( second.isoCode === countryCode.toUpperCase() ) -
					Number( first.isoCode === countryCode.toUpperCase() ) ||
				( second.priority ?? 0 ) - ( first.priority ?? 0 )
		);
	const country = matchingCountries[ 0 ];
	if ( ! country ) {
		return { phoneNumber: value, countryCode };
	}

	// NANP's optional trunk 1 is not normally displayed with a national number.
	const prefix = country.nationalPrefix === '1' ? '' : ( country.nationalPrefix ?? '' );
	return {
		countryCode: country.isoCode,
		phoneNumber:
			prefix +
			number.slice( country.dialCode.length + 1 ) +
			( extension ? ` ext ${ extension }` : '' ),
	};
}

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
