/* eslint-disable */

import { CONTENT_WIDTH } from './constants.js';

// See
// modules/tiled-gallery/tiled-gallery/tiled-gallery-shape.php

// That file contains more classes that extend this class and need to be ported
// Jetpack_Tiled_Gallery_Three
// Jetpack_Tiled_Gallery_Four
// Jetpack_Tiled_Gallery_Five
// etc...

export class Jetpack_Tiled_Gallery_Shape {
	shapes_used = [];

	constructor( images ) {
		this.images = images;
		this.images_left = images.length;
	}

	sum_ratios = ( number_of_images = 3 ) => {
		const ratios = this.images.map( image => image.ratio ); // was wp_list_pluck()
		const segmentOfRatios = ratios.slice( 0, number_of_images ); // was array_slice()

		return segmentOfRatios.reduce( ( accumulator, currentValue ) => accumulator + currentValue ); // was array_sum()

		// wp_list_pluck:
		// https://codex.wordpress.org/Function_Reference/wp_list_pluck
		// "Pluck a certain field out of each object in a list"

		// PHP was:
		// return array_sum( array_slice( wp_list_pluck( $this->images, 'ratio' ), 0, $number_of_images ) );
	}

	next_images_are_symmetric = () => {
		return this.images_left > 2 && this.images[0].ratio === this.images[2].ratio;
	}

	// @TODO
	is_not_as_previous = ( n = 1 ) => {

		return;

		/*
		const shapes = this.shapes_used.slice( -Math.abs( n ) ); // was array_slice()

		// @TODO turn into JS, get_class() is PHP
		const classReference = get_class( this ); // was get_class();

		// @TODO
		return ! shapes.contains( classReference ); // was in_array();
		*/

		// PHP was:
		//return ! in_array( get_class( $this ), array_slice( self::$shapes_used, -$n ) );
	}

	is_wide_theme = () => {
		return CONTENT_WIDTH > 1000;
	}

	image_is_landscape = ( image ) => {
		return image.ratio >= 1 && image.ratio < 2;
	}

	image_is_portrait = ( image ) => {
		return image.ratio < 1;
	}

	image_is_panoramic = ( image ) => {
		return image.ratio >= 2;
	}

	set_last_shape = ( last_shape ) => {
		this.shapes_used.push( last_shape );
	}

	reset_last_shape = () => {
		this.shapes_used = [];
	}
}
