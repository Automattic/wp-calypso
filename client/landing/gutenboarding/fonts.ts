/**
 * External dependencies
 */
import { FONT_PAIRINGS, ANCHORFM_FONT_PAIRINGS } from '@automattic/design-picker';

/**
 * Internal dependencies
 */
import { useIsAnchorFm } from '../gutenboarding/path';

export function useFontPairings() {
	const isAnchorFmSignup = useIsAnchorFm();
	const effectiveFontPairings = isAnchorFmSignup
		? [ ...FONT_PAIRINGS, ...ANCHORFM_FONT_PAIRINGS ]
		: FONT_PAIRINGS;
	return effectiveFontPairings;
}
