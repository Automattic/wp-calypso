import { isNamePulseAvailable, toNamePulseRealtimeVerdict } from './result-status';
import type { NamePulseResultsLayout } from './get-results-layout';
import type { NamePulseDomainResult } from './types';
import type { DomainAvailability } from '@automattic/api-core';

export interface NamePulseExactMatch {
	domainName: string;
	/** Unset while the typed domain is still being checked. */
	result?: NamePulseDomainResult;
}

/**
 * The typed domain gets its own card while it is being checked and once it is
 * found available. A taken name, or a failed check, has no card: its row stays
 * in the grid and the notice explains the verdict.
 */
export function getNamePulseExactMatch(
	fqdn: NamePulseResultsLayout[ 'fqdn' ],
	availability: DomainAvailability | undefined,
	isCheckError: boolean
): NamePulseExactMatch | null {
	if ( ! fqdn || isCheckError ) {
		return null;
	}

	const { fullDomain: domainName, tld } = fqdn;

	if ( availability?.domain_name !== domainName ) {
		return { domainName };
	}

	if ( ! isNamePulseAvailable( availability ) ) {
		return null;
	}

	return {
		domainName,
		result: {
			domain_name: domainName,
			suffix: tld,
			source: 'exact',
			...toNamePulseRealtimeVerdict( availability ),
		},
	};
}
