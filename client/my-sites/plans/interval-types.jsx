/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

import { TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY } from '../../lib/plans/constants';

export const TERM_TO_INTERVAL_TYPE = {
	[ TERM_MONTHLY ]: 'monthly',
	[ TERM_ANNUALLY ]: 'yearly',
	[ TERM_BIENNIALLY ]: '2yearly',
};
