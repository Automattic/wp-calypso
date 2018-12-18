/**
 * Internal dependencies
 */
import { Jetpack_Tiled_Gallery_Shape } from './jetpack-tiled-gallery-shape';

export class Four extends Jetpack_Tiled_Gallery_Shape {
	static shape = [ 1, 1, 1, 1 ];

	is_possible() {
		return (
			this.is_not_as_previous() &&
			( ( this.sum_ratios( 4 ) < 3.5 && this.images_left > 5 ) ||
				( this.sum_ratios( 4 ) < 7 && this.images_left === 4 ) )
		);
	}
}
