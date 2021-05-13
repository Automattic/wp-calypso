/**
 * External dependencies
 */

import { includes, isEqual } from 'lodash';

export default ( options = {} ) => {
	const { ignore, deep, shallow } = options;
	return ( prevProps, nextProps ) => {
		for ( const propName in prevProps ) {
			// Skip ignored properties
			if ( ignore && includes( ignore, propName ) ) {
				continue;
			}

			// Some properties want to be compared deeply
			if ( deep && includes( deep, propName ) ) {
				if ( ! isEqual( prevProps[ propName ], nextProps[ propName ] ) ) {
					return false;
				}

				continue;
			}

			// Compare all other props (or a selected subset) shallowly
			if ( ! shallow || includes( shallow, propName ) ) {
				if ( prevProps[ propName ] !== nextProps[ propName ] ) {
					return false;
				}
			}
		}

		// Find properties that are only in `nextProps` and are not ignored.
		// Presence of such properties means that the objects are not equal.
		for ( const propName in nextProps ) {
			if (
				! ( propName in prevProps ) &&
				! ( ignore && includes( ignore, propName ) ) &&
				! ( shallow && ! includes( shallow, propName ) )
			) {
				return false;
			}
		}

		return true;
	};
};
