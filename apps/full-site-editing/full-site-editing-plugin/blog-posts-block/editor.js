/* eslint-disable import/no-extraneous-dependencies */
/**
 * Internal dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
/* eslint-enable import/no-extraneous-dependencies */

/**
 * NHA dependencies
 */
import { settings } from './newspack-homepage-articles/blocks/homepage-articles/index';
import { registerQueryStore } from './newspack-homepage-articles/blocks/homepage-articles/store';

/**
 * Global properties
 */
if ( typeof window === 'object' && window.wpcomGutenberg ) {
	const { blogPublic } = window.wpcomGutenberg;

	window.newspackIsBlogPrivate = Number( blogPublic ) === -1;
}

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
	category: 'layout',
	supports: {
		...settings.supports,
		multiple: false,
	},
} );

registerQueryStore();
