/** @format */

/**
 * Internal dependencies
 */
import { CONTENT_WIDTH } from './constants.js';
import { get_rounded_constrained_array } from './constrained-array-rounding.js';
import { Jetpack_Tiled_Gallery_Group } from './group.js';
import { Jetpack_Tiled_Gallery_Row } from './row.js';
import {
	Five,
	Four,
	Long_Symmetric_Row,
	One_Three,
	One_Two,
	Panoramic,
	Reverse_Symmetric_Row,
	Symmetric_Row,
	Three,
	Three_One,
	Two_One,
} from './shapes';

export class Jetpack_Tiled_Gallery_Grouper {
	margin = 4;

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
	] );

	images = [];

	constructor( attachments, shapes = [] ) {
		const content_width = CONTENT_WIDTH;

		this.overwrite_shapes( shapes );
		this.last_shape = '';
		this.images = this.get_images_with_sizes( attachments );
		this.grouped_images = this.get_grouped_images();
		this.apply_content_width( content_width );
	}

	overwrite_shapes = shapes => {
		if ( shapes.length ) {
			this.shapes = shapes;
		}
	};

	get_current_row_size = () => {
		/*
		$images_left = count( $this->images );
		if ( $images_left < 3 ) {
			return array_fill( 0, $images_left, 1 );
		}

		foreach ( $this->shapes as $shape_name ) {
			$class_name = "Jetpack_Tiled_Gallery_$shape_name";
			$shape      = new $class_name( $this->images );
			if ( $shape->is_possible() ) {
				Jetpack_Tiled_Gallery_Shape::set_last_shape( $class_name );
				return $shape->shape;
			}
		}

		Jetpack_Tiled_Gallery_Shape::set_last_shape( 'Two' );
		return array( 1, 1 );
		*/
		return [ 1, 1 ];
	};

	get_images_with_sizes = attachments => {
		const images_with_sizes = [];

		for ( const image of attachments ) {
			// Attachments now already include all the meta we need
			// meta = wp_get_attachment_metadata( $image->ID );
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

		const row = [];
		for ( const group_size of vector ) {
			row.push( new Jetpack_Tiled_Gallery_Group( this.images.slice( 0, group_size ) ) );
		}

		return row;
	};

	get_grouped_images = () => {
		const grouped_images = [];
		// @TODO change back to while() if we're reducing `images` somewhere?
		this.images.forEach( () => {
			// while ( ! empty( $this->images ) ) {
			grouped_images.push( new Jetpack_Tiled_Gallery_Row( this.read_row() ) );
		} );
		return grouped_images;
	};

	apply_content_width = width => {
		for ( const row of this.grouped_images ) {
			row.width = width;
			row.raw_height =
				( 1 / row.ratio ) * ( width - this.margin * ( row.groups.length - row.weighted_ratio ) );
			row.height = Math.round( row.raw_height );

			this.calculate_group_sizes( row );
		}
	};

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
		const rounded_group_widths_array = get_rounded_constrained_array(
			group_widths_array,
			row.width
		);

		for ( const group of row.groups ) {
			// @TODO check what happens to `rounded_image_heights_array`
			// in PHP `array_shift([])` vs JS `[].shift()` and if it has affects here
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
		const rounded_image_heights_array = get_rounded_constrained_array(
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
