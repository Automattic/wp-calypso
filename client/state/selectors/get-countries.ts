import type { CountriesState } from '../countries/types';
import type { IAppState } from '../types';

import 'calypso/state/countries/init';

/**
 * Retrieves the list of countries from the specified type.
 *
 * The country data types are 'domains, 'payments', or 'sms'.
 */
export default function getCountries< TType extends keyof CountriesState >(
	state: IAppState,
	type: TType
) {
	return state.countries?.[ type ] ?? null;
}
