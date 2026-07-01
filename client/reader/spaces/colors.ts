import { useTranslate } from 'i18n-calypso';
import type { SpaceColor } from '@automattic/api-core';

/**
 * The accent colors offered by the picker, in display order. The backend only
 * sanitizes the stored value (it does not validate against this list), so the
 * client owns the palette — keep this in sync with the `--space-color` variants
 * in `colors.scss`.
 */
export const SPACE_COLORS: SpaceColor[] = [
	'blue',
	'purple',
	'red',
	'orange',
	'green',
	'celadon',
	'pink',
	'gray',
];

/**
 * The default accent color for a new space: the first color in the picker.
 */
export const DEFAULT_SPACE_COLOR: SpaceColor = SPACE_COLORS[ 0 ];

/**
 * Translated, human-readable labels for each accent color, used as accessible
 * names on the swatches (the swatches are color-only, so they need a text label
 * for screen readers).
 */
export function useSpaceColorLabels(): Record< SpaceColor, string > {
	const translate = useTranslate();
	return {
		blue: translate( 'Blue' ),
		purple: translate( 'Purple' ),
		red: translate( 'Red' ),
		orange: translate( 'Orange' ),
		green: translate( 'Green' ),
		celadon: translate( 'Teal' ),
		pink: translate( 'Pink' ),
		gray: translate( 'Gray' ),
	};
}
