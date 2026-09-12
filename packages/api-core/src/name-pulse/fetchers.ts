import { wpcom } from '../wpcom-fetcher';
import {
	NAME_PULSE_AVAILABILITY_MAX_DOMAINS,
	type NamePulseAvailabilityResponse,
	type NamePulseSuggestionsQuery,
	type NamePulseSuggestionsResponse,
} from './types';

const DEFAULT_PROVIDERS = [ 'verisign', 'domainsbot' ];

/**
 * Fetch keyword (`use_ai=0`) or creative (`use_ai=1`) domain suggestions from the
 * Name Pulse engine. Provider errors ride along in `errors[]`; only when every
 * provider fails does the endpoint reply with a 400.
 */
export async function fetchNamePulseSuggestions( {
	query,
	use_ai = false,
	providers = DEFAULT_PROVIDERS,
	timeout,
	tlds,
	quantity,
	allow_premium = true,
}: NamePulseSuggestionsQuery ): Promise< NamePulseSuggestionsResponse > {
	const response: Partial< NamePulseSuggestionsResponse > = await wpcom.req.get(
		{
			path: '/domains/name-pulse/suggestions',
			apiNamespace: 'wpcom/v2',
		},
		{
			query: query.trim().toLocaleLowerCase(),
			use_ai: use_ai ? 1 : 0,
			allow_premium: allow_premium ? 'true' : 'false',
			providers: providers.join( ',' ),
			...( timeout !== undefined && { timeout } ),
			...( tlds && tlds.length > 0 && { tlds: tlds.join( ',' ) } ),
			...( quantity !== undefined && { quantity } ),
		}
	);

	return {
		suggestions: response.suggestions ?? [],
		errors: response.errors ?? [],
	};
}

/**
 * Bulk zone-file availability check (max 50 domains per call). The response is
 * keyed by domain; unavailable names come back as `{ is_available: false }`.
 */
export async function fetchNamePulseAvailability(
	domainNames: string[]
): Promise< NamePulseAvailabilityResponse > {
	if ( domainNames.length === 0 ) {
		return {};
	}

	if ( domainNames.length > NAME_PULSE_AVAILABILITY_MAX_DOMAINS ) {
		throw new Error(
			`fetchNamePulseAvailability accepts at most ${ NAME_PULSE_AVAILABILITY_MAX_DOMAINS } domains per call`
		);
	}

	const response: NamePulseAvailabilityResponse | null = await wpcom.req.post( {
		path: '/domains/name-pulse/availability-check',
		apiNamespace: 'wpcom/v2',
		body: { domain_names: domainNames },
	} );

	return response ?? {};
}
