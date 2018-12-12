/** @format */
/* eslint-disable */

/**
 * Lets you round the numeric elements of an array to integers while preserving their sum.
 *
 * Usage:
 *
 * Jetpack_Constrained_Array_Rounding::get_rounded_constrained_array( $bound_array )
 * if a specific sum doesn't need to be specified for the bound array
 *
 * Jetpack_Constrained_Array_Rounding::get_rounded_constrained_array( $bound_array, $sum )
 * If the sum of $bound_array must equal $sum after rounding.
 *
 * If $sum is less than the sum of the floor of the elements of the array, the class defaults to using the sum of the array elements.
 */

export const get_rounded_constrained_array = ( bound_array, sum = false ) => {
	return [];
};
/*
	public static function get_rounded_constrained_array( $bound_array, $sum = false ) {
		// Convert associative arrays before working with them and convert them back before returning the values
		$keys        = array_keys( $bound_array );
		$bound_array = array_values( $bound_array );

		$bound_array_int = self::get_int_floor_array( $bound_array );

		$lower_sum = array_sum( wp_list_pluck( $bound_array_int, 'floor' ) );
		if ( ! $sum || ( $sum < $lower_sum ) ) {
			// If value of sum is not supplied or is invalid, calculate the sum that the returned array is constrained to match
			$sum = array_sum( $bound_array );
		}
		$diff_sum = $sum - $lower_sum;

		self::adjust_constrained_array( $bound_array_int, $diff_sum );

		$bound_array_fin = wp_list_pluck( $bound_array_int, 'floor' );
		return array_combine( $keys, $bound_array_fin );
	}
	*/

const get_int_floor_array = bound_array => {
	return [];
};
/*
	private static function get_int_floor_array( $bound_array ) {
		$bound_array_int_floor = array();
		foreach ( $bound_array as $i => $value ) {
			$bound_array_int_floor[ $i ] = array(
				'floor'    => (int) floor( $value ),
				'fraction' => $value - floor( $value ),
				'index'    => $i,
			);
		}

		return $bound_array_int_floor;
	}
	*/

const adjust_constrained_array = ( bound_array_int, adjustment ) => {
	return [];
};
/*
	private static function adjust_constrained_array( &$bound_array_int, $adjustment ) {
		usort( $bound_array_int, array( 'self', 'cmp_desc_fraction' ) );

		$start  = 0;
		$end    = $adjustment - 1;
		$length = count( $bound_array_int );

		for ( $i = $start; $i <= $end; $i++ ) {
			$bound_array_int[ $i % $length ]['floor']++;
		}

		usort( $bound_array_int, array( 'self', 'cmp_asc_index' ) );
	}
	*/

const cmp_desc_fraction = ( a, b ) => {
	return 1;
};
/*
	private static function cmp_desc_fraction( $a, $b ) {
		if ( $a['fraction'] == $b['fraction'] ) {
			return 0;
		}
		return $a['fraction'] > $b['fraction'] ? -1 : 1;
	}
	*/

const cmp_asc_index = ( a, b ) => {
	return 1;
};
/*
	private static function cmp_asc_index( $a, $b ) {
		if ( $a['index'] == $b['index'] ) {
			return 0;
		}
		return $a['index'] < $b['index'] ? -1 : 1;
	}
	*/
