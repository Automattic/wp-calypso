/**
 * Internal dependencies
 */
import { Jetpack_Tiled_Gallery_Shape } from './jetpack-tiled-gallery-shape';

export class Five extends Jetpack_Tiled_Gallery_Shape {
	static shape = [ 1, 1, 1, 1, 1 ];

	is_possible() {
		return (
			this.is_wide_theme() &&
			this.is_not_as_previous() &&
			this.sum_ratios( 5 ) < 5 &&
			( this.images_left === 5 || ( this.images_left !== 10 && this.images_left > 6 ) )
		);
	}
}
