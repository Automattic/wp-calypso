import { I18NContext } from 'i18n-calypso';
import { useEffect, useContext } from 'react';
import { useCountryCodeQuery } from 'calypso/data/geo/use-country-code-query';

function FormatterCountryCodeSync() {
	const countryCode = useCountryCodeQuery();
	const i18n = useContext( I18NContext );

	useEffect( () => {
		if ( countryCode ) {
			// `geoLocation` is soft deprecated and intentionally not part of the public API.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			( i18n as any ).geoLocation = countryCode;
		}
	}, [ countryCode, i18n ] );

	return null;
}

export default FormatterCountryCodeSync;
