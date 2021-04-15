/**
 * Internal dependencies
 */

import { TERM_ANNUALLY, TERM_BIENNIALLY, TERM_MONTHLY } from 'calypso/lib/plans/constants';

export default function getIntervalTypeFromTerm( term ) {
	switch ( term ) {
		case TERM_MONTHLY:
			return 'monthly';
		case TERM_ANNUALLY:
			return 'yearly';
		case TERM_BIENNIALLY:
			return '2yearly';
	}
	return null;
}
