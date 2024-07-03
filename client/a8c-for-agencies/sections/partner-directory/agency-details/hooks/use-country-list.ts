import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useCountries } from 'calypso/landing/stepper/hooks/use-countries';

export interface Option {
	value: string;
	label: string;
}

export function useCountryList() {
	const { data: countriesList } = useCountries();
	const translate = useTranslate();

	return useMemo( () => {
		const countryOptions = < { [ key: string ]: Option } >{};
		const stateOptions = < { [ key: string ]: Array< Option > } >{};

		Object.entries( countriesList ?? [] ).map( ( [ key, value ] ) => {
			// We just have to add the country to the list of countries if the key / country
			// code doesn't include a colon since that means they don't have any states.
			if ( key.indexOf( ':' ) === -1 ) {
				countryOptions[ key ] = {
					value: key,
					label: value,
				};

				return;
			}

			// The countries/states endpoint uses the following formats if they include states:
			// * Code: US:TX
			// * Label: United States (US) — Texas
			// so we wish to split the code by ":" and labels by " — ".
			const [ countryCode ] = key.split( ':' );
			const [ countryLabel ] = value.split( ' — ' );

			if ( ! countryOptions.hasOwnProperty( countryCode ) ) {
				countryOptions[ countryCode ] = {
					value: countryCode,
					label: countryLabel,
				};
			}
		} );

		const countries = Object.values( countryOptions );
		countries.unshift( {
			value: '',
			label: translate( 'Type to find country' ),
		} );

		// Alphabetizes country list after translated.
		countries.sort( ( { label: countryA }, { label: countryB } ) => {
			if ( countryA < countryB ) {
				return -1;
			}
			if ( countryA > countryB ) {
				return 1;
			}
			return 0;
		} );

		return {
			countryOptions: countries as Option[],
			stateOptionsMap: stateOptions,
		};
	}, [ countriesList, translate ] );
}
