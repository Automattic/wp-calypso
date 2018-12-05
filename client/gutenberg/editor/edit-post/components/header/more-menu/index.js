/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
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
import ModeSwitcher from '../mode-switcher';
import PluginMoreMenuGroup from '../plugins-more-menu-group';
import OptionsMenuItem from '../options-menu-item';
import WritingMenu from '../writing-menu';
// GUTENLYPSO START
import CopyContentMenuItem from '../../../plugins/copy-content-menu-item';
import KeyboardShortcutsHelpMenuItem from '../../../plugins/keyboard-shortcuts-help-menu-item';
import OptOutMenuItem from 'gutenberg/editor/components/header/opt-out-menu-item';
// GUTENLYPSO END

const ariaClosed = __( 'Show more tools & options' );
const ariaOpen = __( 'Hide more tools & options' );

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
				<PluginMoreMenuGroup.Slot fillProps={ { onClose } } />
				{ /* GUTENLYPSO START */ }
				<MenuGroup label={ __( 'Tools' ) }>
					<KeyboardShortcutsHelpMenuItem onSelect={ onClose } />
					<CopyContentMenuItem />
				</MenuGroup>
				{ /* GUTENLYPSO END */ }
				<MenuGroup>
					<OptionsMenuItem onSelect={ onClose } />
					<OptOutMenuItem /> { /* GUTENLYPSO */ }
				</MenuGroup>
			</Fragment>
		) }
	/>
);

export default MoreMenu;
