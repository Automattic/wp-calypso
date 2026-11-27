import { statesListQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import type { StatesListItem } from '@automattic/api-core';

/**
 * The states, provinces or regions that domain contact details accept for a
 * country, or `null` while they load. Countries without a list return an empty array.
 */
export default function useCountryStates(
	countryCode: string | undefined | null
): StatesListItem[] | null {
	const { data } = useQuery( {
		...statesListQuery( countryCode?.toLowerCase() ?? '' ),
		enabled: !! countryCode,
	} );
	if ( ! countryCode ) {
		return [];
	}
	return data ?? null;
}
