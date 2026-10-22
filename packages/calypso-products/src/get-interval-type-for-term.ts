import {
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_CENTENNIALLY,
	TERM_MONTHLY,
	TERM_TRIENNIALLY,
} from './constants';
import type { UrlFriendlyTermType } from './constants/terms';

export function getIntervalTypeForTerm(
	term: string | null | undefined
): UrlFriendlyTermType | null {
	switch ( term ) {
		case TERM_MONTHLY:
			return 'monthly';
		case TERM_ANNUALLY:
			return 'yearly';
		case TERM_BIENNIALLY:
			return '2yearly';
		case TERM_TRIENNIALLY:
			return '3yearly';
		case TERM_CENTENNIALLY:
			return '100yearly';
	}
	return null;
}
