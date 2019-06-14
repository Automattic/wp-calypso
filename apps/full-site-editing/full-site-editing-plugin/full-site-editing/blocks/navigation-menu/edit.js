/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { IconButton, ServerSideRender, Toolbar } from '@wordpress/components';
import { BlockControls } from '@wordpress/editor';
import { addQueryArgs } from '@wordpress/url';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

const NavigationMenuEdit = ( { attributes } ) => {
	const url = addQueryArgs( 'customize.php', {
		'autofocus[panel]': 'nav_menus',
		return: window.location.href,
	} );

	return (
		<Fragment>
			<BlockControls>
				<Toolbar className="wp-block-a8c-navigation-menu-toolbar">
					<IconButton
						icon="edit"
						label={ __( 'Edit Menu' ) }
						href={ url }
						className="components-toolbar__control"
					/>
				</Toolbar>
			</BlockControls>
			<ServerSideRender
				attributes={ attributes }
				block="a8c/navigation-menu"
				className="wp-block-a8c-navigation-menu"
			/>
		</Fragment>
	);
};

export default NavigationMenuEdit;
