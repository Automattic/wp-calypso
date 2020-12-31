/**
 * WordPress dependencies
 */

import { serialize } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';

/**
 * Override the default `core/editor` store with functions that return data from `core/block-editor` instead of the post in `core/editor`
 */
export default {
	'core/editor': ( select, registry ) => ( {
		getEditedPostAttribute: ( attributeName ) => {
			if ( attributeName === 'content' ) {
				return serialize( useSelect( ( select ) => select( 'core/block-editor' ).getBlocks() ) );
			}

			if ( attributeName === 'title' ) {
				return '';
			}

			if ( attributeName === 'type' ) {
				return 'post';
			}

			return select.getEditedPostAttribute( attributeName );
		},
		getEditedPostContent: () => {
			return serialize( registry.select( 'core/block-editor' ).getBlocks() );
		},
	} ),
};
