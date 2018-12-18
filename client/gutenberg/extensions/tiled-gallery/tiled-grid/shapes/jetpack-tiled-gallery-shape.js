/**
 * External dependencies
 */
import { map, property, sum, take } from 'lodash';

export class Jetpack_Tiled_Gallery_Shape {
	constructor( images, contentWidth ) {
		this.contentWidth = contentWidth;
		this.images = images;
		this.images_left = images.length;
	}

	static shapes_used = [];

	static set_last_shape( last_shape ) {
		this.shapes_used.push( last_shape );
	}

	static reset_last_shape() {
		this.shapes_used = [];
	}

	sum_ratios( number_of_images = 3 ) {
		return sum( map( take( this.images, number_of_images ), property( 'ratio' ) ) );
	}

	next_images_are_symmetric = () => {
		return this.images_left > 2 && this.images[ 0 ].ratio === this.images[ 2 ].ratio;
	};

	is_not_as_previous( n = 1 ) {
		return ! take( Jetpack_Tiled_Gallery_Shape.shapes_used, n ).includes( this.constructor );
	}

	//
	// Replace this with something more appropriate.
	//
	// Check for full/wide block alignment?
	//
	// https://github.com/WordPress/gutenberg/blob/0416bae17c52b0a11ec1075c0928f879264b7d75/packages/editor/src/components/block-alignment-toolbar/index.js#L80
	//
	is_wide_theme = () => {
		return this.contentWidth > 1000;
	};

	image_is_landscape = image => {
		return image.ratio >= 1 && image.ratio < 2;
	};

	image_is_portrait = image => {
		return image.ratio < 1;
	};

	image_is_panoramic = image => {
		return image.ratio >= 2;
	};
}
