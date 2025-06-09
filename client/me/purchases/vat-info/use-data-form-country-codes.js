import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import useCountryList, {
	isVatSupported,
} from 'calypso/my-sites/checkout/src/hooks/use-country-list';

function getUniqueCountries( countries ) {
	const unique = [];
	countries.forEach( ( country ) => {
		if ( unique.map( ( x ) => x.code ).includes( country.code ) ) {
			return;
		}
		unique.push( country );
	} );
	return unique;
}

export default function useDataFormCountryCodes() {
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
