/**
 * External dependencies
 */
import {
	castArray,
	includes,
	isArray,
	get,
	some,
} from 'lodash';

/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';

export function ThemeSupportCheck( { themeSupports, children, postType, supportKeys } ) {
	const isSupported = some(
		castArray( supportKeys ), ( key ) => {
			const supported = get( themeSupports, [ key ], false );
			// 'post-thumbnails' can be boolean or an array of post types.
			// In the latter case, we need to verify `postType` exists
			// within `supported`. If `postType` isn't passed, then the check
			// should fail.
			if ( 'post-thumbnails' === key && isArray( supported ) ) {
				return includes( supported, postType );
			}
			return supported;
		}
	);

	if ( ! isSupported ) {
		return null;
	}

	return children;
}

export default withSelect( ( select ) => {
	const { getThemeSupports } = select( 'core' );
	const { getEditedPostAttribute } = select( 'core/editor' );
	return {
		postType: getEditedPostAttribute( 'type' ),
		themeSupports: getThemeSupports(),
	};
} )( ThemeSupportCheck );
