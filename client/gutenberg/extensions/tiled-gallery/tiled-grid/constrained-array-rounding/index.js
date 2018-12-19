/** @format */

// Originally `Jetpack_Constrained_Array_Rounding` class from:
// https://github.com/Automattic/jetpack/blob/0d837791212dcfab0e75145a21857cc507e4c9d3/modules/tiled-gallery/math/class-constrained-array-rounding.php

/**
 * External dependencies
 */
import { map, sum } from 'lodash';

const get_int_floor_array = bound_array => {
	return bound_array.map( ( value, i ) => ( {
		floor: Math.floor( value ),
		fraction: value - Math.floor( value ),
		index: i,
	} ) );
};

const adjust_constrained_array = ( bound_array_int, adjustment ) => {
	// Sorting function here was `cmp_desc_fraction()` in PHP
	bound_array_int = bound_array_int.sort( ( a, b ) => {
		if ( a.fraction === b.fraction ) {
			return 0;
		}
		return a.fraction > b.fraction ? -1 : 1;
	} );

	const end = adjustment - 1;

	for ( let i = 0; i <= end; i++ ) {
		bound_array_int[ i % bound_array_int.length ].floor++;
	}

	// Sorting function here was `cmp_asc_index()` in PHP
	return bound_array_int.sort( ( a, b ) => {
		if ( a.index === b.index ) {
			return 0;
		}
		return a.index < b.index ? -1 : 1;
	} );
};

/**
 * Lets you round the numeric elements of an array to integers while preserving their sum.
 *
 * Usage:
 *
 * If a specific sum doesn't need to be specified for the bound array:
 * ```
 * getRoundedConstrainedArray( bound_array )
 * ```
 *
 * If the sum of bound_array must equal sum_value after rounding:
 * ```
 * getRoundedConstrainedArray( bound_array, sum_value )
 * ```
 *
 * If sum_value is less than the sum of the floor of the elements of the array,
 * the function defaults to using the sum of the array elements.
 *
 * @param {Array} bound_array Array with numeric values
 * @param {Boolean|Integer} sum_value Value that the sum of bound_array must equal after rounding
 *
 * @returns {Array} Array with numeric elements rounded to integers, while their sum is preserved.
 */
export const getRoundedConstrainedArray = ( bound_array, sum_value = false ) => {
	let bound_array_int = get_int_floor_array( bound_array );

	const lower_sum = sum( map( bound_array_int, 'floor' ) );

	if ( ! sum_value || sum_value < lower_sum ) {
		// If value of sum is not supplied or is invalid,
		// calculate the sum that the returned array is constrained to match
		sum_value = sum( bound_array );
	}

	const diff_sum = sum_value - lower_sum;

	bound_array_int = adjust_constrained_array( bound_array_int, diff_sum );

	return map( bound_array_int, 'floor' );
};
