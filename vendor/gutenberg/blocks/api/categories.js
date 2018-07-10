/**
 * WordPress dependencies
 */
import { dispatch, select } from '@wordpress/data';

/**
 * Returns all the block categories.
 *
 * @return {Object[]} Block categories.
 */
export function getCategories() {
	return select( 'core/blocks' ).getCategories();
}

/**
 * Sets the block categories.
 *
 * @param {Object[]} categories Block categories.
 */
export function setCategories( categories ) {
	dispatch( 'core/blocks' ).setCategories( categories );
}
