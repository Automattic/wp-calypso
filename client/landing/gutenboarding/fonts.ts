/**
 * External dependencies
 */
import { fontPairings, anchorFmFontPairings } from '@automattic/design-picker';

/**
 * Internal dependencies
 */
import { useIsAnchorFm } from '../gutenboarding/path';

export function useFontPairings() {
	const isAnchorFmSignup = useIsAnchorFm();
	const effectiveFontPairings = isAnchorFmSignup
		? [ ...fontPairings, ...anchorFmFontPairings ]
		: fontPairings;
	return effectiveFontPairings;
}
