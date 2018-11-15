/** @format */

/**
 * External dependencies
 */
import { isString, isEqualWith } from 'lodash';

export default function isEqualCaseInsensitive( value, other ) {
	return isEqualWith( value, other, ( main, additional ) => {
		if ( isString( main ) && isString( additional ) ) {
			return main.toLowerCase() === additional.toLowerCase();
		}
	} );
}
