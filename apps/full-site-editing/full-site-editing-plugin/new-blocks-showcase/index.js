/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { getCategories, setCategories } from '@wordpress/blocks';

/**
 * This script needs to run *before* any block is registered! This makes sure
 * the category filter doesn't miss any blocks targeted for the "New" category.
 */

const NEW_CATEGORY = {
	slug: 'new',
	title: __( 'New', 'a8c' ),
	// icon: TBD,
};

const NEW_BLOCKS = [
	// An example content for testing purposes:
	'a8c/blog-posts',
	'a8c/posts-carousel',
	'jetpack/podcast-player',
	'jetpack/tiled-gallery',
	'jetpack/slideshow',
	'core/gallery',
];

/**
 * Sets NEW_CATEGORY to blocks from the NEW_BLOCKS list.
 *
 * @param {object} settings - Block settings
 * @param {string} name - Block name
 * @returns {object} New Block settings
 */
function setNewCategory( settings, name ) {
	if ( ! NEW_BLOCKS.includes( name ) ) {
		return settings;
	}

	return {
		...settings,
		category: NEW_CATEGORY.slug,
	};
}

// Add the "New" block category to the top
setCategories( [ NEW_CATEGORY, ...getCategories() ] );

// Register the filter for setting the "New" category to the blocks from the list:
addFilter( 'blocks.registerBlockType', 'full-site-editing/new-blocks-showcase', setNewCategory );
