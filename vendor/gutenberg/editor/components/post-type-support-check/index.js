/**
 * External dependencies
 */
import { some, castArray } from 'lodash';

/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';

/**
 * A component which renders its own children only if the current editor post
 * type supports one of the given `supportKeys` prop.
 *
 * @param {?Object}           props.postType    Current post type.
 * @param {WPElement}         props.children    Children to be rendered if post
 *                                              type supports.
 * @param {(string|string[])} props.supportKeys String or string array of keys
 *                                              to test.
 *
 * @return {WPElement} Rendered element.
 */
export function PostTypeSupportCheck( { postType, children, supportKeys } ) {
	let isSupported = true;
	if ( postType ) {
		isSupported = some(
			castArray( supportKeys ),
			( key ) => !! postType.supports[ key ]
		);
	}

	if ( ! isSupported ) {
		return null;
	}

	return children;
}

export default withSelect( ( select ) => {
	const { getEditedPostAttribute } = select( 'core/editor' );
	const { getPostType } = select( 'core' );
	return {
		postType: getPostType( getEditedPostAttribute( 'type' ) ),
	};
} )( PostTypeSupportCheck );
