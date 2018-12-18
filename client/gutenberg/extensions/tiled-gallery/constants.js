/** @format */

/**
 * Internal Dependencies
 */
import { _x } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const ALLOWED_MEDIA_TYPES = [ 'image' ];
export const DEFAULT_COLUMNS = 3;
export const DEFAULT_GALLERY_WIDTH = 580;
export const DEFAULT_LAYOUT = 'rectangular';
export const LAYOUT_STYLES = [
	{
		isDefault: true,
		label: _x( 'Tiled mosaic', 'Tiled gallery layout' ),
		name: 'rectangular',
	},
	{
		label: _x( 'Circles', 'Tiled gallery layout' ),
		name: 'circle',
	},
	{
		label: _x( 'Square tiles', 'Tiled gallery layout' ),
		name: 'square',
	},
	{
		label: _x( 'Tiled columns', 'Tiled gallery layout' ),
		name: 'columns',
	},
];
export const MAX_COLUMNS = 20;
export const TILE_MARGIN = 2;
