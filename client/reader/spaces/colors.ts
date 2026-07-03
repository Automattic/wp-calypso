import { useTranslate } from 'i18n-calypso';
import type { SpaceColor, SpaceLayout, SpaceTextColor } from '@automattic/api-core';

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
 * The default icon color for a new space: the first color in the picker.
 */
export const DEFAULT_SPACE_COLOR: SpaceColor = SPACE_COLORS[ 0 ];

/**
 * The default text accent for a new space: `'none'`, so the feed reads like the
 * rest of the Reader until the user opts into coloring the post text.
 */
export const DEFAULT_SPACE_TEXT_COLOR: SpaceTextColor = 'none';

/**
 * Resolve the color to render a space's icon with. Uses the dedicated
 * `iconColor` when set, otherwise the text `color` — so spaces created before
 * the two were split keep a colored icon — falling back to the default when the
 * text color is `'none'`.
 */
export function resolveSpaceIconColor(
	layout: Pick< SpaceLayout, 'color' | 'iconColor' >
): SpaceColor {
	if ( layout.iconColor ) {
		return layout.iconColor;
	}
	return layout.color === 'none' ? DEFAULT_SPACE_COLOR : layout.color;
}

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
