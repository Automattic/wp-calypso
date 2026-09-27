import { NAME_PULSE_TOP_RESULTS_COUNT } from './constants';
import { NamePulseDomainStatus, type NamePulseDomainResult } from './types';

/**
 * A cart check means the user just clicked the row, so it holds its slot to carry
 * the outcome instead of being replaced by a backfill under the cursor. Every other
 * taken name leaves, however its verdict was reached.
 */
const isCandidate = ( result: NamePulseDomainResult ) =>
	result.status === NamePulseDomainStatus.AVAILABLE ||
	result.status === NamePulseDomainStatus.WAITING ||
	!! result.is_cart_check;

/**
 * The backend owns the TLD order, so the first candidates in list order are featured.
 */
export function getTopResults(
	results: NamePulseDomainResult[],
	count = NAME_PULSE_TOP_RESULTS_COUNT
): NamePulseDomainResult[] {
	return results.filter( isCandidate ).slice( 0, count );
}

/**
 * AI mode has no exact matches to feature, so the cheapest available
 * suggestions stand in; the name breaks ties to keep the order stable.
 */
export function getAiTopResults(
	lists: NamePulseDomainResult[][],
	count = NAME_PULSE_TOP_RESULTS_COUNT
): NamePulseDomainResult[] {
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
		.slice( 0, count );
}
