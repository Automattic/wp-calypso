/** @format */

/**
 * Internal dependencies
 */
import { Jetpack_Tiled_Gallery_Item } from './item';

export class Jetpack_Tiled_Gallery_Rectangular_Item extends Jetpack_Tiled_Gallery_Item {
	// eslint-disable-next-line no-unused-vars
	constructor( attachment_image, needs_attachment_link, grayscale ) {
		super();

		this.size = 'large';

		if ( this.image.width < 250 ) {
			this.size = 'small';
		}
	}
}
