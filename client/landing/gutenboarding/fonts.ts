/**
 * Internal dependencies
 */
import { fontPairings, anchorFmFontPairings } from '../gutenboarding/constants';
import { useIsAnchorFm } from '../gutenboarding/path';

export function useFontPairings() {
	const isAnchorFmSignup = useIsAnchorFm();
	const effectiveFontPairings = isAnchorFmSignup
		? [ ...fontPairings, ...anchorFmFontPairings ]
		: fontPairings;
	return effectiveFontPairings;
}
