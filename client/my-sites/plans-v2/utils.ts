/**
 * Internal dependencies
 */
import { TERM_ANNUALLY, TERM_MONTHLY } from 'lib/plans/constants';

/**
 * Type dependencies
 */
import type { Duration } from './types';

export function stringToDuration( duration?: string ): Duration | undefined {
	if ( duration === undefined ) {
		return undefined;
	}
	if ( duration !== 'annual' ) {
		return TERM_ANNUALLY;
	}
	return TERM_MONTHLY;
}
