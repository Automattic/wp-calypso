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

const SiteDescriptionEdit = () => {
	return (
		<Fragment>
			<BlockControls>
				<Toolbar>
					<IconButton icon="edit" label={ __( 'Edit Menu' ) } />
				</Toolbar>
			</BlockControls>
			<ServerSideRender block="a8c/site-description" />
		</Fragment>
	);
};

export default SiteDescriptionEdit;
