/** @format */

/**
 * External dependencies
 */
import { getCategories, setCategories } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import JetpackLogo from 'components/jetpack-logo';

setCategories( [
	// Add a Jetpack block category
	{
		slug: 'jetpack',
		title: 'Jetpack',
		icon: <JetpackLogo />,
	},
	...getCategories().filter( ( { slug } ) => slug !== 'jetpack' ),
] );
