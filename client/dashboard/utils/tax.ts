import { __ } from '@wordpress/i18n';
import type { CountryListItem } from '@automattic/api-core';

interface CountryCodeOption {
	label: string;
	value: string;
}

function getUniqueCountries< C extends CountryListItem >( countries: C[] ): C[] {
	const unique: C[] = [];
	countries.forEach( ( country ) => {
		if ( unique.map( ( x ) => x.code ).includes( country.code ) ) {
			return;
		}
		unique.push( country );
	} );
	return unique;
}

export function getDataFormCountryCodes( countries: CountryListItem[] ): CountryCodeOption[] {
	const uniqueCountries = getUniqueCountries( countries );
	const codes = uniqueCountries.map( ( country ) =>
		country.vat_supported
			? country.tax_country_codes.map( ( countryCode: string ) => {
					const countryName = countryCode === 'XI' ? __( 'Northern Ireland' ) : country.name;
					return {
						label: `${ countryCode } - ${ countryName }`,
						value: countryCode,
					};
			  } )
			: {
					label: `${ country.code } - ${ country.name }`,
					value: country.code,
			  }
	);
	return codes.flat();
}

export function getTaxName(
	countryList: CountryListItem[],
	countryCode: string
): undefined | string {
	const country = countryList.find( ( country: CountryListItem ) => country.code === countryCode );
	return country?.tax_name;
}

// Some countries prefix the VAT ID with the country code, but that's not
// part of the ID as we need it formatted, so here we strip the country
// code out if it is there.
export function stripCountryCodeFromVatId(
	id: string,
	country: string | undefined | null
): string {
	// Switzerland often uses the prefix 'CHE-' instead of just `CH`.
	const swissCodeRegexp = /^CHE-?/i;
	if ( country === 'CH' && swissCodeRegexp.test( id ) ) {
		return id.replace( swissCodeRegexp, '' );
	}

	const first2UppercasedChars = id.slice( 0, 2 ).toUpperCase();
	if ( first2UppercasedChars === country ) {
		return id.slice( 2 );
	}

	return id;
}
