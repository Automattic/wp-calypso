/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton, Dropdown, MenuGroup } from '@wordpress/components';

/**
 * Internal dependencies
 */
import ModeSwitcher from '../mode-switcher';
import FixedToolbarToggle from '../fixed-toolbar-toggle';
import PluginMoreMenuGroup from '../plugins-more-menu-group';
import TipsToggle from '../tips-toggle';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const MoreMenu = () => (
	<Dropdown
		className="edit-post-more-menu"
		position="bottom left"
		renderToggle={ ( { isOpen, onToggle } ) => (
			<IconButton
				icon="ellipsis"
				label={ __( 'More' ) }
				onClick={ onToggle }
				aria-expanded={ isOpen }
			/>
		) }
		renderContent={ ( { onClose } ) => (
			<div className="edit-post-more-menu__content">
				<ModeSwitcher onSelect={ onClose } />
				<MenuGroup
					label={ __( 'Settings' ) }
					filterName="editPost.MoreMenu.settings"
				>
					<FixedToolbarToggle onToggle={ onClose } />
					<TipsToggle onToggle={ onClose } />
				</MenuGroup>
				<PluginMoreMenuGroup.Slot fillProps={ { onClose } } />
				<MenuGroup
					label={ __( 'Tools' ) }
					filterName="editPost.MoreMenu.tools"
				/>
			</div>
		) }
	/>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

export default MoreMenu;
