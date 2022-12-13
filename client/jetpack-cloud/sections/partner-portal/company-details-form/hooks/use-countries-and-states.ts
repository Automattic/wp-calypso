import { useTranslate } from 'i18n-calypso';
import { ReactChild, useMemo } from 'react';
import { useCountries } from 'calypso/landing/stepper/hooks/use-countries';

/**
 * List of countries Stripe allow state/area/province values for.
 */
const stripeSupportedStateCountries = [
	'AR',
	'AU',
	'BR',
	'CA',
	'CL',
	'CN',
	'CO',
	'CR',
	'EG',
	'ES',
	'HK',
	'HN',
	'ID',
	'IE',
	'IN',
	'IR',
	'IT',
	'JM',
	'JP',
	'MX',
	'MZ',
	'NG',
	'NI',
	'PA',
	'PE',
	'PH',
	'SV',
	'TH',
	'TR',
	'UA',
	'US',
	'UY',
	'VE',
];

export interface Option {
	value: string;
	label: ReactChild;
	isLabel: boolean;
}

export function useCountriesAndStates() {
	const { data: countriesList } = useCountries();
	const translate = useTranslate();

	return useMemo( () => {
		const countryOptions = <{ [ key: string ]: Option }>{};
		const stateOptions = <{ [ key: string ]: Array< object > }>{};

		Object.entries( countriesList ?? [] ).map( ( [ key, value ] ) => {
			// We just have to add the country to the list of countries if the key / country
			// code doesn't include a colon since that means they don't have any states.
			if ( key.indexOf( ':' ) === -1 ) {
				countryOptions[ key ] = {
					value: key,
					label: value,
					isLabel: false,
				};

				return;
			}

			// The countries/states endpoint uses the following formats if they include states:
			// * Code: US:TX
			// * Label: United States (US) — Texas
			// so we wish to split the code by ":" and labels by " — ".
			const [ countryCode, stateCode ] = key.split( ':' );
			const [ countryLabel, stateLabel ] = value.split( ' — ' );

			if ( ! countryOptions.hasOwnProperty( countryCode ) ) {
				countryOptions[ countryCode ] = {
					value: countryCode,
					label: countryLabel,
					isLabel: false,
				};
			}

			// Add states to the country if Stripe supports it for the specific country.
			if ( stripeSupportedStateCountries.indexOf( countryCode ) >= 0 ) {
				if ( ! stateOptions.hasOwnProperty( countryCode ) ) {
					stateOptions[ countryCode ] = [];
				}

				stateOptions[ countryCode ].push( {
					value: stateCode,
					label: stateLabel,
					isLabel: false,
				} );
			}
		} );

		const countries = Object.values( countryOptions );
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

		countries.unshift( {
			value: '',
			label: translate( 'Type to find country' ),
			isLabel: true,
		} );

		return {
			countryOptions: countries as Option[],
			stateOptionsMap: stateOptions,
		};
	}, [ countriesList ] );
}
