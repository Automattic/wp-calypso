import { useTranslate } from 'i18n-calypso';
import type { ShelfColor, ShelfLayout, ShelfTextColor } from '@automattic/api-core';

/**
 * The accent colors offered by the picker, in display order. The backend only
 * sanitizes the stored value (it does not validate against this list), so the
 * client owns the palette — keep this in sync with the `--shelf-color` variants
 * in `colors.scss`.
 */
export const SHELF_COLORS: ShelfColor[] = [
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
 * The default icon color for a new shelf: the first color in the picker.
 */
export const DEFAULT_SHELF_COLOR: ShelfColor = SHELF_COLORS[ 0 ];

/**
 * The default text accent for a new shelf: `'none'`, so the feed reads like the
 * rest of the Reader until the user opts into coloring the post text.
 */
export const DEFAULT_SHELF_TEXT_COLOR: ShelfTextColor = 'none';

/**
 * Resolve the color to render a shelf's icon with. Uses the dedicated
 * `iconColor` when set, otherwise the text `color` — so shelves created before
 * the two were split keep a colored icon — falling back to the default when the
 * text color is `'none'`.
 */
export function resolveShelfIconColor(
	layout: Pick< ShelfLayout, 'color' | 'iconColor' >
): ShelfColor {
	if ( layout.iconColor ) {
		return layout.iconColor;
	}
	return layout.color === 'none' ? DEFAULT_SHELF_COLOR : layout.color;
}

/**
 * Translated, human-readable labels for each accent color, used as accessible
 * names on the swatches (the swatches are color-only, so they need a text label
 * for screen readers).
 */
export function useShelfColorLabels(): Record< ShelfColor, string > {
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
