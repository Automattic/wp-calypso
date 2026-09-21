import { wpcom } from '../wpcom-fetcher';
import type {
	NamePulseAvailabilityResponse,
	NamePulseSuggestionsQuery,
	NamePulseSuggestionsResponse,
} from './types';

/**
 * Only `verisign` and `domainsbot` are honoured; `donuts` is filtered out server-side.
 */
const PROVIDERS = 'verisign,domainsbot';

/**
 * Provider errors ride along in `errors[]`; only when every provider fails does
 * the endpoint reply with a 400.
 */
export async function fetchNamePulseSuggestions( {
	query,
	use_ai = false,
}: NamePulseSuggestionsQuery ): Promise< NamePulseSuggestionsResponse > {
	const response: Partial< NamePulseSuggestionsResponse > = await wpcom.req.get(
		{
			path: '/domains/name-pulse/suggestions',
			apiNamespace: 'wpcom/v2',
		},
		{
			query,
			use_ai: use_ai ? 1 : 0,
			allow_premium: 'true',
			providers: PROVIDERS,
		}
	);

	return {
		suggestions: response.suggestions ?? [],
		errors: response.errors ?? [],
	};
}

/**
 * Zone-file based, so results are approximate.
 */
export async function fetchNamePulseAvailability(
	domainNames: string[]
): Promise< NamePulseAvailabilityResponse > {
	const response: NamePulseAvailabilityResponse | null = await wpcom.req.post( {
		path: '/domains/name-pulse/availability-check',
		apiNamespace: 'wpcom/v2',
		body: { domain_names: domainNames },
	} );

	return response ?? {};
}

export async function fetchNamePulseTlds(): Promise< string[] > {
	const response: { tlds?: string[] } | null = await wpcom.req.get( {
		path: '/domains/name-pulse/tlds',
		apiNamespace: 'wpcom/v2',
	} );

	return response?.tlds ?? [];
}
