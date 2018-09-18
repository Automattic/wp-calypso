/** @format */

/**
 * External dependencies
 */
import { getCategories, setCategories } from '@wordpress/blocks';

setCategories( [
	// Add a Jetpack block category
	{ slug: 'jetpack', title: 'Jetpack' },
	...getCategories().filter( ( { slug } ) => slug !== 'jetpack' ),
] );
