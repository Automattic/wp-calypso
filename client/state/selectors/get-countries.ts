import type { CountriesState } from '../countries/types';
import type { IAppState } from '../types';
import type { CountryListItem } from '@automattic/wpcom-checkout';

import 'calypso/state/countries/init';

/**
 * Retrieves the list of countries from the specified type.
 *
 * @param {Object} state - global state tree
 * @param {string} type - type of list ('domains, 'payments', or 'sms)
 * @returns {null|CountryListItem[]} the list of countries
 */
export default function getCountries(
	state: IAppState,
	type: keyof CountriesState
): CountryListItem[] | null {
	return state.countries?.[ type ] ?? null;
}
