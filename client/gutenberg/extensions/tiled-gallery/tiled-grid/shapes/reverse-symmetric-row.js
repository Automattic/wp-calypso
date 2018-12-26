/**
 * Internal dependencies
 */
import { Jetpack_Tiled_Gallery_Shape } from './jetpack-tiled-gallery-shape';

export class Reverse_Symmetric_Row extends Jetpack_Tiled_Gallery_Shape {
	static shape = [ 2, 1, 2 ];

	is_possible() {
		return (
			this.is_not_as_previous( 5 ) &&
			this.images_left > 15 &&
			this.image_is_landscape( this.images[ 0 ] ) &&
			this.image_is_landscape( this.images[ 1 ] ) &&
			this.image_is_portrait( this.images[ 2 ] ) &&
			this.image_is_landscape( this.images[ 3 ] ) &&
			this.image_is_landscape( this.images[ 4 ] )
		);
	}
}
