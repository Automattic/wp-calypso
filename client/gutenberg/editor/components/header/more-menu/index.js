/** @format */
/**
 * External dependencies
 */
import React, { Fragment } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton, Dropdown, MenuGroup } from '@wordpress/components';

/**
 * Internal dependencies
 */
import CopyContentMenuItem from '../copy-content-menu-item';
import KeyboardShortcutsHelpMenuItem from '../keyboard-shortcuts-help-menu-item';
import ModeSwitcher from '../mode-switcher';
import OptOutMenuItem from '../opt-out-menu-item';
import OptionsMenuItem from '../options-menu-item';
import PluginsMoreMenuGroup from '../plugins-more-menu-group';
import WritingMenu from '../writing-menu';

const ariaClosed = __( 'Show more tools & options' );
const ariaOpen = __( 'Hide more tools & options' );

/* eslint-disable wpcalypso/jsx-classname-namespace */
const MoreMenu = () => (
	<Dropdown
		className="edit-post-more-menu"
		contentClassName="edit-post-more-menu__content"
		position="bottom left"
		renderToggle={ ( { isOpen, onToggle } ) => (
			<IconButton
				icon="ellipsis"
				label={ isOpen ? ariaOpen : ariaClosed }
				onClick={ onToggle }
				aria-expanded={ isOpen }
			/>
		) }
		renderContent={ ( { onClose } ) => (
			<Fragment>
				<WritingMenu onClose={ onClose } />
				<ModeSwitcher onSelect={ onClose } />
				<PluginsMoreMenuGroup.Slot fillProps={ { onClose } } />
				<MenuGroup label={ __( 'Tools' ) }>
					<KeyboardShortcutsHelpMenuItem onSelect={ onClose } />
					<CopyContentMenuItem />
				</MenuGroup>
				<MenuGroup>
					<OptionsMenuItem onSelect={ onClose } />
					<OptOutMenuItem />
				</MenuGroup>
			</Fragment>
		) }
	/>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

export default MoreMenu;
