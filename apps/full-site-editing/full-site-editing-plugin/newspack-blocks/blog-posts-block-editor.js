/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import { settings } from './synced-newspack-blocks/blocks/homepage-articles/index';
import { registerQueryStore } from './synced-newspack-blocks/blocks/homepage-articles/store';

/**
 * Block name in the A8C\FSE context.
 */
const blogPostsName = 'a8c/blog-posts';

function setBlockTransformationName( name ) {
	if ( name === 'newspack-blocks/homepage-articles' ) {
		return blogPostsName;
	}

	return name;
}

addFilter(
	'blocks.transforms_from_name',
	'set-transformed-block-name',
	setBlockTransformationName
);

registerBlockType( blogPostsName, {
	...settings,
	title: __( 'Blog Posts', 'full-site-editing' ),
	category: 'layout',
} );
registerQueryStore( blogPostsName );
