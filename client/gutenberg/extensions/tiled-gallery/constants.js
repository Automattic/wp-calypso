/** @format */

/**
 * External Dependencies
 */
import { _x } from '@wordpress/i18n';

export const DEFAULT_COLUMNS = 3;
export const MAX_COLUMNS = 20;
export const TILE_MARGIN = 2;
export const LAYOUTS = [
	{
		label: _x( 'Tiled mosaic', 'Tiled gallery layout', 'jetpack' ),
		name: 'rectangular',
		isDefault: true,
	},
	{
		label: _x( 'Tiled columns', 'Tiled gallery layout', 'jetpack' ),
		name: 'columns',
	},
	{
		label: _x( 'Square tiles', 'Tiled gallery layout', 'jetpack' ),
		name: 'square',
	},
	{
		label: _x( 'Circles', 'Tiled gallery layout', 'jetpack' ),
		name: 'circle',
	},
];
