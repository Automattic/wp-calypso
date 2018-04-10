/** @format */

/**
 * Internal dependencies
 */

import { TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY } from 'lib/plans/constants';

export default function getIntervalTypeFromTerm( term ) {
	return (
		{
			[ TERM_MONTHLY ]: 'monthly',
			[ TERM_ANNUALLY ]: 'yearly',
			[ TERM_BIENNIALLY ]: '2yearly',
		}[ term ] || null
	);
}
