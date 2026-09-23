import { NAME_PULSE_TOP_RESULTS_COUNT, NAME_PULSE_TOP_RESULTS_TLDS } from './constants';
import { NamePulseDomainStatus, type NamePulseDomainResult } from './types';

/**
 * When the label ends with a TLD ("myapp" → "app") that TLD is promoted to the
 * second slot, right after `blog`.
 */
export function calculateTopTlds( baseName: string, tlds: readonly string[] ): string[] {
	const topTlds = [ ...NAME_PULSE_TOP_RESULTS_TLDS ];
	const matchedTld = tlds.find( ( tld ) => baseName.endsWith( tld ) );

	if ( ! matchedTld || matchedTld === 'blog' ) {
		return topTlds;
	}

	const existingIndex = topTlds.indexOf( matchedTld );
	if ( existingIndex !== -1 ) {
		topTlds.splice( existingIndex, 1 );
	}

	topTlds.splice( 1, 0, matchedTld );

	return topTlds.slice( 0, NAME_PULSE_TOP_RESULTS_TLDS.length );
}

/**
 * A real-time verdict means the user just clicked the row, so it holds its slot to
 * carry the outcome instead of being replaced by a backfill under the cursor.
 */
const isCandidate = ( result: NamePulseDomainResult ) =>
	result.status === NamePulseDomainStatus.AVAILABLE ||
	result.status === NamePulseDomainStatus.WAITING ||
	!! result.is_realtime;

/**
 * Preferred TLDs first, then backfill in list order.
 */
export function getTopResults(
	results: NamePulseDomainResult[],
	topTlds: readonly string[]
): NamePulseDomainResult[] {
	const preferred: NamePulseDomainResult[] = [];
	const backfill: NamePulseDomainResult[] = [];

	for ( const result of results ) {
		if ( isCandidate( result ) ) {
			( topTlds.includes( result.suffix ) ? preferred : backfill ).push( result );
		}
	}

	return [ ...preferred, ...backfill ].slice( 0, NAME_PULSE_TOP_RESULTS_COUNT );
}

/**
 * AI mode has no exact matches to feature, so the cheapest available
 * suggestions stand in; the name breaks ties to keep the order stable.
 */
export function getAiTopResults( ...lists: NamePulseDomainResult[][] ): NamePulseDomainResult[] {
	const byName = new Map< string, NamePulseDomainResult >();

	for ( const result of lists.flat() ) {
		if ( result.status === NamePulseDomainStatus.AVAILABLE && ! byName.has( result.domain_name ) ) {
			byName.set( result.domain_name, result );
		}
	}

	return Array.from( byName.values() )
		.sort(
			( a, b ) =>
				( a.raw_price ?? Infinity ) - ( b.raw_price ?? Infinity ) ||
				a.domain_name.localeCompare( b.domain_name )
		)
		.slice( 0, NAME_PULSE_TOP_RESULTS_COUNT );
}
