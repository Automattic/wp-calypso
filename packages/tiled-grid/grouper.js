/* eslint-disable */

import { Jetpack_Tiled_Gallery_Row } from './row.js';
import { Jetpack_Tiled_Gallery_Group } from './group.js';
import { get_rounded_constrained_array } from './constrained-array-rounding.js';

const CONTENT_WIDTH = 640; // same as example.png

export class Jetpack_Tiled_Gallery_Grouper {
	margin = 4;

	shapes = [
		'Reverse_Symmetric_Row',
		'Long_Symmetric_Row',
		'Symmetric_Row',
		'One_Three',
		'Three_One',
		'One_Two',
		'Five',
		'Four',
		'Three',
		'Two_One',
		'Panoramic',
	];

	images = [];

	constructor( attachments, shapes = [] ) {
		const content_width = CONTENT_WIDTH;

		this.overwrite_shapes( shapes );
		this.last_shape     = '';
		this.images         = this.get_images_with_sizes( attachments );
		this.grouped_images = this.get_grouped_images();
		this.apply_content_width( content_width );
	}

	overwrite_shapes = ( shapes ) => {
		if ( shapes.length ) {
			this.shapes = shapes;
		}
	}

	get_images_with_sizes = ( attachments ) => {
		return attachments;
	}


	read_row = (  ) => {
		const vector = this.get_current_row_size();

		let row = [];
		for ( group_size of vector ) {
			row.push(
				new Jetpack_Tiled_Gallery_Group(
					this.images.slice( 0, group_size )
				)
			)
		}

		return row;
	}

	get_grouped_images = () => {
		let grouped_images = [];
		while ( ! this.images.length ) {
			grouped_images.push(
				new Jetpack_Tiled_Gallery_Row( this.read_row() )
			);
		}
		return grouped_images;
	}

	apply_content_width = ( width ) => {
		for ( row of this.grouped_images ) {
			row.width      = width;
			row.raw_height = 1 / row.ratio * ( width - this.margin * ( row.groups.length - row.weighted_ratio ) );
			row.height     = Math.round( row.raw_height );

			this.calculate_group_sizes( row );
		}
	}

	calculate_group_sizes = ( row ) => {
		// Storing the calculated group heights in an array for rounding them later while preserving their sum
		// This fixes the rounding error that can lead to a few ugly pixels sticking out in the gallery

		let group_widths_array = [];
		for ( group of row.groups ) {
			group.height = row.height;
			// Storing the raw calculations in a separate property to prevent
			// rounding errors from cascading down and for diagnostics
			group.raw_width = ( row.raw_height - this.margin * group.images.length ) * group.ratio + this.margin;
			group_widths_array.push( group.raw_width );
		}

		let rounded_group_widths_array = get_rounded_constrained_array( group_widths_array, row.width );

		/*
		foreach ( $row->groups as $group ) {
			$group->width = array_shift( $rounded_group_widths_array );
			$this->calculate_image_sizes( $group );
		}
		*/
	}

	calculate_image_sizes = ( group ) => {
		/*
		// Storing the calculated image heights in an array for rounding them later while preserving their sum
		// This fixes the rounding error that can lead to a few ugly pixels sticking out in the gallery
		$image_heights_array = array();
		foreach ( $group->images as $image ) {
			$image->width = $group->width - $this->margin;
			// Storing the raw calculations in a separate property for diagnostics
			$image->raw_height     = ( $group->raw_width - $this->margin ) / $image->ratio;
			$image_heights_array[] = $image->raw_height;
		}

		$image_height_sum            = $group->height - count( $image_heights_array ) * $this->margin;
		$rounded_image_heights_array = get_rounded_constrained_array( $image_heights_array, $image_height_sum );

		foreach ( $group->images as $image ) {
			$image->height = array_shift( $rounded_image_heights_array );
		}
		*/
	}
};
