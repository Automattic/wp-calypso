/** @format */

/*
 * Mosaic layout
 *
 * Implements `Jetpack_Tiled_Gallery_Layout_Rectangular` from:
 * https://github.com/Automattic/jetpack/blob/0d837791212dcfab0e75145a21857cc507e4c9d3/modules/tiled-gallery/tiled-gallery/tiled-gallery-rectangular.php
 */

/**
 * External dependencies
 */
// eslint-disable-next-line import/no-nodejs-modules
import { inspect } from 'util';
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies
 */
import { attachments } from './test/fixtures/attachments';
import { Jetpack_Tiled_Gallery_Grouper } from './grouper';
import { Jetpack_Tiled_Gallery_Shape } from './shapes/jetpack-tiled-gallery-shape';

export const mosaicLayout = ( { images } ) => {
	const grouper = new Jetpack_Tiled_Gallery_Grouper( images );
	Jetpack_Tiled_Gallery_Shape.reset_last_shape();
	return grouper.grouped_images;
};

// For debugging while building this
const layout = mosaicLayout( { images: cloneDeep( attachments ) } );
// eslint-disable-next-line no-console
console.log( inspect( layout, { showHidden: false, depth: null } ) );
