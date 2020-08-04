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
	if ( duration === 'monthly' ) {
		return TERM_MONTHLY;
	}
	return TERM_ANNUALLY;
}
