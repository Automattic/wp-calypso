import { generateExactMatches } from './generate-exact-matches';
import { isNamePulseAvailable } from './result-status';
import type { NamePulseResultsLayout } from './get-results-layout';
import type { DomainAvailability } from '@automattic/api-core';

export interface NamePulseExactMatch {
	domainName: string;
	tld: string;
	/** Unset while the typed domain is still being checked. */
	availability?: DomainAvailability;
}

/**
 * The domain that gets the Exact match card: the typed one, or the name with
 * the only ending the filter allows, which reads the same as typing it.
 */
export function getNamePulseExactTarget(
	layout: NamePulseResultsLayout,
	selectedTlds: readonly string[]
): NamePulseResultsLayout[ 'fqdn' ] {
	if ( layout.fqdn ) {
		return layout.fqdn;
	}

	if ( selectedTlds.length !== 1 || ( layout.mode !== 'single' && layout.mode !== 'keyword' ) ) {
		return undefined;
	}

	// Named the way its grid row is, so the card can take that row's place.
	const [ { domain_name: fullDomain, suffix: tld } ] = generateExactMatches(
		layout.baseName,
		selectedTlds
	);

	return { baseName: fullDomain.slice( 0, -( tld.length + 1 ) ), tld, fullDomain };
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
		return { domainName, tld };
	}

	if ( ! isNamePulseAvailable( availability ) ) {
		return null;
	}

	return { domainName, tld, availability };
}
