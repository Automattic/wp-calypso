import { wooCountryRegionsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

// The downstream HubSpot form only supports states for these countries, so a
// state is only collected when one of them is selected.
export const STATE_SUPPORTED_COUNTRIES = [ 'US', 'AU', 'CA' ];

export interface Option {
	value: string;
	label: string;
}

/**
 * Country options plus the state options of the countries a state is collected
 * for. The endpoint lists states as "US:TX" entries with
 * "United States (US) — Texas" labels.
 */
export function useCountryOptions() {
	const { data: countryRegions } = useQuery( wooCountryRegionsQuery() );

	return useMemo( () => {
		const countries = new Map< string, string >();
		const statesByCountry: Record< string, Option[] > = {};

		for ( const [ code, label ] of Object.entries( countryRegions ?? {} ) ) {
			const [ countryCode, stateCode ] = code.split( ':' );
			const [ countryLabel, stateLabel ] = label.split( ' — ' );

			if ( ! countries.has( countryCode ) ) {
				countries.set( countryCode, countryLabel );
			}

			if ( stateCode && STATE_SUPPORTED_COUNTRIES.includes( countryCode ) ) {
				statesByCountry[ countryCode ] ??= [];
				statesByCountry[ countryCode ].push( { value: stateCode, label: stateLabel } );
			}
		}

		const countryOptions = Array.from( countries, ( [ value, label ] ) => ( {
			value,
			label,
		} ) ).sort( ( a, b ) => a.label.localeCompare( b.label ) );

		return { countryOptions, statesByCountry };
	}, [ countryRegions ] );
}
