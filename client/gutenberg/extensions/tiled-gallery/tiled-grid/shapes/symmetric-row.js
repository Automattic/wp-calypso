/**
 * Internal dependencies
 */
import { Jetpack_Tiled_Gallery_Shape } from './jetpack-tiled-gallery-shape';

export class Symmetric_Row extends Jetpack_Tiled_Gallery_Shape {
	static shape = [ 1, 2, 1 ];

	is_possible() {
		return (
			this.is_not_as_previous( 5 ) &&
			this.images_left > 3 &&
			this.images_left !== 5 &&
			this.image_is_portrait( this.images[ 0 ] ) &&
			this.image_is_landscape( this.images[ 1 ] ) &&
			this.image_is_landscape( this.images[ 2 ] ) &&
			this.image_is_portrait( this.images[ 3 ] )
		);
	}
}
