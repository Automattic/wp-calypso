/** @format */

/**
 * Internal dependencies
 */
import { Jetpack_Tiled_Gallery_Shape } from './super';

export class Panoramic extends Jetpack_Tiled_Gallery_Shape {
	static shape = [ 1 ];

	is_possible() {
		return this.image_is_panoramic( this.images[ 0 ] );
	}
}
