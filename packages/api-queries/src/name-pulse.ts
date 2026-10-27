import {
	fetchNamePulseAvailability,
	fetchNamePulseSuggestions,
	fetchNamePulseTlds,
	type NamePulseSuggestionsQuery,
} from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

/**
 * Name Pulse results are cached for five minutes.
 */
const NAME_PULSE_STALE_TIME = 5 * 60 * 1000;

/**
 * The TLD list changes rarely (backend-owned order, paid placement), so it is
 * cached for an hour.
 */
const NAME_PULSE_TLDS_STALE_TIME = 60 * 60 * 1000;

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

export const namePulseTldsQuery = () =>
	queryOptions( {
		queryKey: [ 'name-pulse-tlds' ],
		queryFn: () => fetchNamePulseTlds(),
		staleTime: NAME_PULSE_TLDS_STALE_TIME,
		gcTime: NAME_PULSE_TLDS_STALE_TIME,
		meta: { persist: false },
	} );
