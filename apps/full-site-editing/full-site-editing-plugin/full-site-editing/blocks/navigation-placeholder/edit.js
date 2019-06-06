/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { IconButton, ServerSideRender, Toolbar } from '@wordpress/components';
import { BlockControls } from '@wordpress/editor';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

const NavigationPlaceholderEdit = ( { attributes } ) => {
	const redirectToCustomizer = () => {
		window.location.href = 'https://wordpress.com';
	};
	return (
		<Fragment>
			<BlockControls>
				<Toolbar>
					<IconButton icon="edit" label={ __( 'Edit Menu' ) } onClick={ redirectToCustomizer } />
				</Toolbar>
			</BlockControls>
			<ServerSideRender block="a8c/navigation-placeholder" attributes={ attributes } />
		</Fragment>
	);
};

export default NavigationPlaceholderEdit;
