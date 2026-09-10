import {
	NAME_PULSE_TLDS,
	NAME_PULSE_TOP_RESULTS_COUNT,
	NAME_PULSE_TOP_RESULTS_TLDS,
} from './constants';
import { NamePulseDomainStatus, type NamePulseDomainResult } from './types';

/**
 * TLDs to feature for this base label. When the label ends with a TLD string
 * ("myapp" → "app") that TLD is promoted to the second slot, right after `blog`.
 */
export function calculateTopTlds(
	baseName: string,
	defaultTopTlds: readonly string[] = NAME_PULSE_TOP_RESULTS_TLDS,
	tlds: readonly string[] = NAME_PULSE_TLDS
): string[] {
	const topTlds = [ ...defaultTopTlds ];
	const matchedTld = tlds.find( ( tld ) => baseName.endsWith( tld ) );

	if ( ! matchedTld || matchedTld === 'blog' ) {
		return topTlds;
	}

	const existingIndex = topTlds.indexOf( matchedTld );
	if ( existingIndex !== -1 ) {
		topTlds.splice( existingIndex, 1 );
	}

	topTlds.splice( 1, 0, matchedTld );

	return topTlds.slice( 0, defaultTopTlds.length );
}

const isCandidate = ( result: NamePulseDomainResult ) =>
	result.status === NamePulseDomainStatus.AVAILABLE ||
	result.status === NamePulseDomainStatus.WAITING;

/**
 * Pick the featured rows: preferred TLDs that are available or still being
 * checked, then backfill from the rest of the map in insertion order.
 */
export function getTopResults(
	results: Map< string, NamePulseDomainResult >,
	topTlds: readonly string[],
	count: number = NAME_PULSE_TOP_RESULTS_COUNT
): NamePulseDomainResult[] {
	const all = Array.from( results.values() );
	const picked: NamePulseDomainResult[] = [];
	const used = new Set< string >();

	const pushIfCandidate = ( result: NamePulseDomainResult ) => {
		if ( picked.length < count && ! used.has( result.domain_name ) && isCandidate( result ) ) {
			picked.push( result );
			used.add( result.domain_name );
		}
	};

	all.filter( ( result ) => topTlds.includes( result.suffix ) ).forEach( pushIfCandidate );
	all.forEach( pushIfCandidate );

	return picked;
}
