import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import useCountryList, {
	isVatSupported,
} from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import type { CountryListItem } from '@automattic/wpcom-checkout';

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

export default function useDataFormCountryCodes(): CountryCodeOption[] {
	const translate = useTranslate();
	const countries = useCountryList();

	const countryCodes = useMemo( () => {
		const vatCountries = getUniqueCountries( countries.filter( isVatSupported ) );
		const codes = vatCountries.map( ( country ) =>
			country.tax_country_codes.map( ( countryCode ) => {
				const countryName = countryCode === 'XI' ? translate( 'Northern Ireland' ) : country.name;
				return {
					label: `${ countryCode } - ${ countryName }`,
					value: countryCode,
				};
			} )
		);
		return codes.flat();
	}, [ countries, translate ] );

	return countryCodes;
}
