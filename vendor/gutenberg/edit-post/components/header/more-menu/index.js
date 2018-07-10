/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { IconButton, Dropdown, MenuGroup } from '@wordpress/components';

/**
 * Internal dependencies
 */
import './style.scss';
import ModeSwitcher from '../mode-switcher';
import FixedToolbarToggle from '../fixed-toolbar-toggle';
import PluginMoreMenuGroup from '../plugins-more-menu-group';
import TipsToggle from '../tips-toggle';

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

export default MoreMenu;
