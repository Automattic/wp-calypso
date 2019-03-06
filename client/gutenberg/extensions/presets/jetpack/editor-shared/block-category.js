/**
 * External dependencies
 */
import { getCategories, setCategories } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import JetpackLogo from './jetpack-logo';

setCategories( [
	...getCategories().filter( ( { slug } ) => slug !== 'jetpack' ),
	// Add a Jetpack block category
	{
		slug: 'jetpack',
		title: 'Jetpack',
		icon: <JetpackLogo />,
	},
] );
