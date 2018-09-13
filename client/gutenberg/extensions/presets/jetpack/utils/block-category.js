/** @format */

/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { getCategories, setCategories } from '@wordpress/blocks';

setCategories( [
	// Add a Jetpack block category
	{ slug: 'jetpack', title: __( 'Jetpack' ) },
	...getCategories(),
] );
