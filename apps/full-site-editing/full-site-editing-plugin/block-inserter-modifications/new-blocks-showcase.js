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
	/* translators: Category name for recently added blocks. */
	title: __( 'New', 'full-site-editing' ),
};

/**
 * Currently selected blocks to be showcased via the "New" category.
 *
 * @see {@link https://github.com/Automattic/wp-calypso/pull/41822#discussion_r420993908}
 */
const NEW_BLOCKS = [
	'jetpack/podcast-player',
	'premium-content/container',
	'jetpack/calendly',
	'jetpack/eventbrite',
	'jetpack/opentable',
	'jetpack/revue',
];

// Add the "New" block category to the top (under the "Most Used").
setCategories( [ NEW_CATEGORY, ...getCategories() ] );

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

// Register the filter for setting the "New" category to the blocks from the list:
addFilter( 'blocks.registerBlockType', 'full-site-editing/new-blocks-showcase', setNewCategory );
