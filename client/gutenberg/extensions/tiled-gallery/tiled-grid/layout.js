/**
 * External dependencies
 */
import { cloneDeep, find, repeat } from 'lodash';

/**
 * Internal dependencies
 */
import { getRoundedConstrainedArray } from './constrained-array-rounding';
import { Jetpack_Tiled_Gallery_Column } from './column.js';
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

export class Jetpack_Tiled_Gallery_Layout {
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

		// @TODO This appears to be a pipeline attachments -> columns
		// Layouts want columns to define their rows
		//
		// This module could (should) become a transformation of <Array<Image>> -> <Array<Row>>
		//
		// If we redesign with that flow in mind, this may get much simpler and more testable
		this.images = this.get_images_with_sizes(
			// Use cloneDeep to avoid mutating the received attachments
			// @FIXME In a future iteration, don't mutate and drop cloneDeep
			cloneDeep( attachments )
		);
		this.columns = this.get_columns();
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
		for ( const column_size of vector ) {
			// @TODO This deeply nested mutation drives iteration, can we improve that?
			row.push( new Jetpack_Tiled_Gallery_Column( this.images.splice( 0, column_size ) ) );
		}

		return row;
	};

	// @FIXME In conjuction with read_row
	get_columns = () => {
		const columns = [];

		// this.read_row mutates this.images
		while ( this.images.length ) {
			columns.push( new Jetpack_Tiled_Gallery_Row( this.read_row() ) );
		}

		return columns;
	};

	apply_content_width = contentWidth => {
		for ( const row of this.columns ) {
			row.width = contentWidth;
			row.raw_height =
				( 1 / row.ratio ) *
				( contentWidth - this.margin * ( row.columns.length - row.weighted_ratio ) );
			row.height = Math.round( row.raw_height );

			this.calculate_column_sizes( row );
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

	calculate_column_sizes = row => {
		// Storing the calculated column heights in an array for rounding them later while preserving their sum
		// This fixes the rounding error that can lead to a few ugly pixels sticking out in the gallery
		const column_widths_array = [];
		for ( const column of row.columns ) {
			column.height = row.height;
			// Storing the raw calculations in a separate property to prevent
			// rounding errors from cascading down and for diagnostics
			column.raw_width =
				( row.raw_height - this.margin * column.images.length ) * column.ratio + this.margin;
			column_widths_array.push( column.raw_width );
		}

		const rounded_column_widths_array = getRoundedConstrainedArray( column_widths_array, row.width );

		for ( const column of row.columns ) {
			column.width = rounded_column_widths_array.shift();
			this.calculate_image_sizes( column );
		}
	};

	calculate_image_sizes = column => {
		// Storing the calculated image heights in an array for rounding them later while preserving their sum
		// This fixes the rounding error that can lead to a few ugly pixels sticking out in the gallery
		const image_heights_array = [];
		for ( const image of column.images ) {
			image.width = column.width - this.margin;
			// Storing the raw calculations in a separate property for diagnostics
			image.raw_height = ( column.raw_width - this.margin ) / image.ratio;
			image_heights_array.push( image.raw_height );
		}

		const image_height_sum = column.height - image_heights_array.length * this.margin;
		const rounded_image_heights_array = getRoundedConstrainedArray(
			image_heights_array,
			image_height_sum
		);

		for ( const image of column.images ) {
			// @TODO check what happens to `rounded_image_heights_array`
			// in PHP `array_shift([])` vs JS `[].shift()` and if it has affects here
			image.height = rounded_image_heights_array.shift();
		}
	};
}
