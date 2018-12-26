/**
 * Internal dependencies
 */
import { Jetpack_Tiled_Gallery_Shape } from './jetpack-tiled-gallery-shape';

export class Three_One extends Jetpack_Tiled_Gallery_Shape {
	static shape = [ 3, 1 ];

	is_possible() {
		return (
			this.is_not_as_previous( 3 ) &&
			this.images_left > 3 &&
			this.image_is_portrait( this.images[ 3 ] ) &&
			this.image_is_landscape( this.images[ 0 ] ) &&
			this.image_is_landscape( this.images[ 1 ] ) &&
			this.image_is_landscape( this.images[ 2 ] )
		);
	}
}
