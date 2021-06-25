/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { settings } from './synced-newspack-blocks/blocks/homepage-articles/index';
import { registerQueryStore } from './synced-newspack-blocks/blocks/homepage-articles/store';

/**
 * Block name in the A8C\FSE context.
 */
const blockName = 'a8c/blog-posts';

function setBlockTransformationName( name ) {
	return name !== 'newspack-blocks/homepage-articles' ? name : blockName;
}

addFilter(
	'blocks.transforms_from_name',
	'set-transformed-block-name',
	setBlockTransformationName
);

registerBlockType( blockName, {
	...settings,
	title: __( 'Blog Posts', 'full-site-editing' ),
	category: 'widgets',
} );

registerQueryStore( blockName );
