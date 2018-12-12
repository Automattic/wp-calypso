/** @format */

/**
 * External dependencies
 */
import { map, property, sum, take } from 'lodash';

/**
 * Internal dependencies
 */
import { CONTENT_WIDTH } from '../constants';

// See
// modules/tiled-gallery/tiled-gallery/tiled-gallery-shape.php

// That file contains more classes that extend this class and need to be ported
// Jetpack_Tiled_Gallery_Three
// Jetpack_Tiled_Gallery_Four
// Jetpack_Tiled_Gallery_Five
// etc...

export class Jetpack_Tiled_Gallery_Shape {
	static shapes_used = [];

	constructor( images ) {
		this.images = images;
		this.images_left = images.length;
	}

	sum_ratios = ( number_of_images = 3 ) => {
		return sum( map( take( this.images, number_of_images ), property( 'ratio' ) ) );
		// PHP was:
		// return array_sum( array_slice( wp_list_pluck( $this->images, 'ratio' ), 0, $number_of_images ) );
	};

	next_images_are_symmetric = () => {
		return this.images_left > 2 && this.images[ 0 ].ratio === this.images[ 2 ].ratio;
	};

	// @TODO
	is_not_as_previous = ( n = 1 ) => {
		return ! take( this.shapes_used, n ).includes( this.constructor );

		/*
		const shapes = this.shapes_used.slice( -Math.abs( n ) ); // was array_slice()

		// @TODO turn into JS, get_class() is PHP
		const classReference = get_class( this ); // was get_class();

		// @TODO
		return ! shapes.contains( classReference ); // was in_array();
		*/

		// PHP was:
		//return ! in_array( get_class( $this ), array_slice( self::$shapes_used, -$n ) );
	};

	//
	// Find and replace usage with:
	//
	// wideControlsEnabled: select( 'core/editor' ).getEditorSettings().alignWide,
	//
	// https://github.com/WordPress/gutenberg/blob/0416bae17c52b0a11ec1075c0928f879264b7d75/packages/editor/src/components/block-alignment-toolbar/index.js#L80
	//
	is_wide_theme = () => {
		return CONTENT_WIDTH > 1000;
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

	set_last_shape = last_shape => {
		this.shapes_used.push( last_shape );
	};

	reset_last_shape = () => {
		this.shapes_used = [];
	};
}
