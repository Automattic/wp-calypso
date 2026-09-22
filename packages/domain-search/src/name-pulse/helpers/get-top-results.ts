import { NAME_PULSE_TOP_RESULTS_COUNT } from './constants';
import { NamePulseDomainStatus, type NamePulseDomainResult } from './types';

/**
 * A real-time verdict means the user just clicked the row, so it holds its slot to
 * carry the outcome instead of being replaced by a backfill under the cursor.
 */
const isCandidate = ( result: NamePulseDomainResult ) =>
	result.status === NamePulseDomainStatus.AVAILABLE ||
	result.status === NamePulseDomainStatus.WAITING ||
	!! result.is_realtime;

/**
 * The backend owns the TLD order, so the first candidates in list order are featured.
 */
export function getTopResults( results: NamePulseDomainResult[] ): NamePulseDomainResult[] {
	return results.filter( isCandidate ).slice( 0, NAME_PULSE_TOP_RESULTS_COUNT );
}
