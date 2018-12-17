/**
 * Internal dependencies
 */
import { Jetpack_Tiled_Gallery_Shape } from './jetpack-tiled-gallery-shape';

export class Two extends Jetpack_Tiled_Gallery_Shape {
	static shape = [ 1, 1 ];

	is_possible() {
		return true;
	}
}
