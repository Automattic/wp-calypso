/**
 * External dependencies
 */
import React from 'react';
import { difference } from 'lodash';

/**
 * WordPress dependencies
 */
import { IconButton } from '@wordpress/components';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import PluginBlockSettingsMenuGroup from './plugin-block-settings-menu-group';

const isEverySelectedBlockAllowed = ( selected, allowed ) => difference( selected, allowed ).length === 0;

/**
 * Plugins may want to add an item to the menu either for every block
 * or only for the specific ones provided in the `allowedBlocks` component property.
 *
 * If there are multiple blocks selected the item will be rendered if every block
 * is of one allowed type (not necesarily the same).
 *
 * @param {string[]} selectedBlockNames Array containing the names of the blocks selected
 * @param {string[]} allowedBlockNames Array containing the names of the blocks allowed
 * @return {boolean} Whether the item will be rendered or not.
 */
const shouldRenderItem = ( selectedBlockNames, allowedBlockNames ) => ! Array.isArray( allowedBlockNames ) ||
	isEverySelectedBlockAllowed( selectedBlockNames, allowedBlockNames );

/* eslint-disable wpcalypso/jsx-classname-namespace */
const PluginBlockSettingsMenuItem = ( { allowedBlocks, icon, label, onClick, small, role } ) => (
	<PluginBlockSettingsMenuGroup>
		{ ( { selectedBlocks, onClose } ) => {
			if ( ! shouldRenderItem( selectedBlocks, allowedBlocks ) ) {
				return null;
			}
			return ( <IconButton
				className="editor-block-settings-menu__control"
				onClick={ compose( onClick, onClose ) }
				icon={ icon || 'admin-plugins' }
				label={ small ? label : undefined }
				role={ role }
			>
				{ ! small && label }
			</IconButton> );
		} }
	</PluginBlockSettingsMenuGroup>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

export default PluginBlockSettingsMenuItem;
