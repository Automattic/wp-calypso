/**
 * Internal dependencies
 */
import { Jetpack_Tiled_Gallery_Shape } from './jetpack-tiled-gallery-shape';

export class One_Two extends Jetpack_Tiled_Gallery_Shape {
	static shape = [ 1, 2 ];

	// This seems buggy, we check >= 2 images, but look at 0,1,2??
	// https://github.com/Automattic/jetpack/blob/e07addf220d02226f04d874b1b565ceb9f502839/modules/tiled-gallery/tiled-gallery/tiled-gallery-shape.php#L91-L94
	is_possible() {
		return (
			this.is_not_as_previous( 3 ) &&
			this.images_left >= 2 &&
			this.images[ 0 ].ratio < 1.6 &&
			this.images[ 1 ].ratio >= 0.9 &&
			this.images[ 1 ].ratio < 2.0 &&
			this.images[ 2 ].ratio >= 0.9 &&
			this.images[ 2 ].ratio < 2.0
		);
	}
}
