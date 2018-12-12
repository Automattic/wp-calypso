/** @format */

/**
 * Internal dependencies
 */
import { Jetpack_Tiled_Gallery_Rectangular_Item } from './rectangular-item.js';

export class Jetpack_Tiled_Gallery_Group {
	constructor( images ) {
		this.images = images;
		this.ratio = this.get_ratio();
	}

	get_ratio = () => {
		let ratio = 0;
		for ( const image of this.images ) {
			if ( image.ratio ) {
				ratio += 1 / image.ratio;
			}
		}

		if ( ! ratio ) {
			return 1;
		}

		return 1 / ratio;
	};

	items = ( needs_attachment_link, grayscale ) => {
		const items = [];

		for ( const image of this.images ) {
			items.push(
				new Jetpack_Tiled_Gallery_Rectangular_Item( image, needs_attachment_link, grayscale )
			);
		}

		return items;
	};
}
