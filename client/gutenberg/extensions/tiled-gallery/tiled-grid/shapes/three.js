/**
 * Internal dependencies
 */
import { Jetpack_Tiled_Gallery_Shape } from './jetpack-tiled-gallery-shape';

export class Three extends Jetpack_Tiled_Gallery_Shape {
	static shape = [ 1, 1, 1 ];

	is_possible() {
		const ratio = this.sum_ratios( 3 );
		const hasEnoughImages = this.images_left >= 3 && ! [ 4, 6 ].includes( this.images_left );
		return (
			hasEnoughImages &&
			this.is_not_as_previous( 3 ) &&
			( ratio < 2.5 || ( ratio < 5 && this.next_images_are_symmetric() ) || this.is_wide_theme() )
		);
	}
}
