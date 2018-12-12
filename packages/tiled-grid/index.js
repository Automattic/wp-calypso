/* eslint-disable */

/*
 * Mosaic layout
 *
 * Implements `Jetpack_Tiled_Gallery_Layout_Rectangular`
 *
 * from modules/tiled-gallery/tiled-gallery/tiled-gallery-rectangular.php
 *
 */

import { attachments } from './attachments';
import { Jetpack_Tiled_Gallery_Grouper } from './grouper';
import { Jetpack_Tiled_Gallery_Shape } from './shape';

const grouper = new Jetpack_Tiled_Gallery_Grouper( attachments );

//Jetpack_Tiled_Gallery_Shape::reset_last_shape();

console.log( 'Rows:', grouper.grouped_images );
