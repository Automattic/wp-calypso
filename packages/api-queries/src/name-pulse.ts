import {
	fetchNamePulseAvailability,
	fetchNamePulseSuggestions,
	type NamePulseSuggestionsQuery,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

/**
 * Name Pulse results are cached for five minutes, matching the TTL of the
 * localStorage cache in the standalone leandomainsearch.com app that this
 * replaces. Nothing is persisted across sessions.
 */
const NAME_PULSE_STALE_TIME = 5 * 60 * 1000;

export const namePulseSuggestionsQuery = ( params: NamePulseSuggestionsQuery ) =>
	queryOptions( {
		queryKey: [ 'name-pulse-suggestions', params ],
		queryFn: () => fetchNamePulseSuggestions( params ),
		staleTime: NAME_PULSE_STALE_TIME,
		meta: { persist: false },
	} );

export const namePulseAvailabilityQuery = ( domainNames: string[] ) =>
	queryOptions( {
		queryKey: [ 'name-pulse-availability', domainNames ],
		queryFn: () => fetchNamePulseAvailability( domainNames ),
		staleTime: NAME_PULSE_STALE_TIME,
		meta: { persist: false },
	} );
