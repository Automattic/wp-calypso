/**
 * External dependencies
 */
import { cloneDeep, find, repeat } from 'lodash';

/**
 * Internal dependencies
 */
import { getRoundedConstrainedArray } from './constrained-array-rounding';
import { Jetpack_Tiled_Gallery_Group } from './group.js';
import { Jetpack_Tiled_Gallery_Row } from './row.js';
import {
	Five,
	Four,
	Jetpack_Tiled_Gallery_Shape,
	Long_Symmetric_Row,
	One_Three,
	One_Two,
	Panoramic,
	Reverse_Symmetric_Row,
	Symmetric_Row,
	Three,
	Three_One,
	Two,
	Two_One,
} from './shapes';

export class Jetpack_Tiled_Gallery_Grouper {
	contentWidth;

	margin;

	// This list is ordered. If you put a shape that's likely to occur on top, it will happen all the time.
	shapes = Object.freeze( [
		Reverse_Symmetric_Row,
		Long_Symmetric_Row,
		Symmetric_Row,
		One_Three,
		Three_One,
		One_Two,
		Five,
		Four,
		Three,
		Two_One,
		Panoramic,
		Two, // Fallback option, always matches
	] );

	images = [];

	constructor( { attachments, contentWidth, margin } ) {
		this.contentWidth = contentWidth;
		this.margin = margin;

		// @TODO This appears to be a pipeline attachments -> grouped images
		// Layouts want grouped_images to define their rows
		//
		// This module could (should) become a transformation of <Array<Image>> -> <Array<Row>>
		//
		// If we redesign with that flow in mind, this may get much simpler and more testable
		this.images = this.get_images_with_sizes(
			// Use cloneDeep to avoid mutating the received attachments
			// @FIXME In a future iteration, don't mutate and drop cloneDeep
			cloneDeep( attachments )
		);
		this.grouped_images = this.get_grouped_images();
		this.apply_content_width( contentWidth );
	}

	get_current_row_size() {
		if ( this.images.length < 3 ) {
			return repeat( 1, this.images.length );
		}

		const Shape = find( this.shapes, Klass => {
			return new Klass( this.images, this.contentWidth ).is_possible();
		} );

		if ( Shape ) {
			Jetpack_Tiled_Gallery_Shape.set_last_shape( Shape );
			return Shape.shape;
		}

		Jetpack_Tiled_Gallery_Shape.set_last_shape( Two );
		return Two.shape;
	}

	get_images_with_sizes = attachments => {
		const images_with_sizes = [];

		// @TODO let's `return map( images… )`
		for ( const image of attachments ) {
			image.width_orig = image.width && image.width > 0 ? image.width : 1;
			image.height_orig = image.height && image.height > 0 ? image.height : 1;
			image.ratio = image.width_orig / image.height_orig;
			image.ratio = image.ratio ? image.ratio : 1;
			images_with_sizes.push( image );
		}

		return images_with_sizes;
	};

	read_row = () => {
		const vector = this.get_current_row_size();

		// @TODO `return map( vector… )`
		const row = [];
		for ( const group_size of vector ) {
			// @TODO This deeply nested mutation drives iteration, can we improve that?
			row.push( new Jetpack_Tiled_Gallery_Group( this.images.splice( 0, group_size ) ) );
		}

		return row;
	};

	// @FIXME In conjuction with read_row
	get_grouped_images = () => {
		const grouped_images = [];

		// this.read_row mutates this.images
		while ( this.images.length ) {
			grouped_images.push( new Jetpack_Tiled_Gallery_Row( this.read_row() ) );
		}

		return grouped_images;
	};

	apply_content_width = contentWidth => {
		for ( const row of this.grouped_images ) {
			row.width = contentWidth;
			row.raw_height =
				( 1 / row.ratio ) *
				( contentWidth - this.margin * ( row.groups.length - row.weighted_ratio ) );
			row.height = Math.round( row.raw_height );

			this.calculate_group_sizes( row );
		}
	};

	/**
	 * @TODO
	 *
	 * The following two methods are virtually same, right? 🤨
	 * One for width, one for height?
	 *
	 * Area for improvement.
	 */

	calculate_group_sizes = row => {
		// Storing the calculated group heights in an array for rounding them later while preserving their sum
		// This fixes the rounding error that can lead to a few ugly pixels sticking out in the gallery
		const group_widths_array = [];
		for ( const group of row.groups ) {
			group.height = row.height;
			// Storing the raw calculations in a separate property to prevent
			// rounding errors from cascading down and for diagnostics
			group.raw_width =
				( row.raw_height - this.margin * group.images.length ) * group.ratio + this.margin;
			group_widths_array.push( group.raw_width );
		}

		const rounded_group_widths_array = getRoundedConstrainedArray( group_widths_array, row.width );

		for ( const group of row.groups ) {
			group.width = rounded_group_widths_array.shift();
			this.calculate_image_sizes( group );
		}
	};

	calculate_image_sizes = group => {
		// Storing the calculated image heights in an array for rounding them later while preserving their sum
		// This fixes the rounding error that can lead to a few ugly pixels sticking out in the gallery
		const image_heights_array = [];
		for ( const image of group.images ) {
			image.width = group.width - this.margin;
			// Storing the raw calculations in a separate property for diagnostics
			image.raw_height = ( group.raw_width - this.margin ) / image.ratio;
			image_heights_array.push( image.raw_height );
		}

		const image_height_sum = group.height - image_heights_array.length * this.margin;
		const rounded_image_heights_array = getRoundedConstrainedArray(
			image_heights_array,
			image_height_sum
		);

		for ( const image of group.images ) {
			// @TODO check what happens to `rounded_image_heights_array`
			// in PHP `array_shift([])` vs JS `[].shift()` and if it has affects here
			image.height = rounded_image_heights_array.shift();
		}
	};
}
