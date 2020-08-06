/**
 * Internal dependencies
 */
import { TERM_ANNUALLY, TERM_MONTHLY } from 'lib/plans/constants';
import { translate, TranslateResult } from 'i18n-calypso';

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

export function durationToText( duration: Duration ): TranslateResult {
	return duration === TERM_MONTHLY
		? translate( 'per month, billed monthly' )
		: translate( 'per year' );
}
