import { isEnabled } from '@automattic/calypso-config';
import { __ } from '@wordpress/i18n';
import {
	bell,
	buttons,
	commentAuthorAvatar,
	lock,
	notAllowed,
	payment,
	seen,
	settings,
	starEmpty,
} from '@wordpress/icons';
import { useAppContext } from '../../app/context';
import MenuDivider from '../../components/menu-divider';
import ResponsiveMenu from '../../components/responsive-menu';
import { SidebarMenu, SidebarMenuItem } from '../../components/sidebar';
import type { AppConfig, MeSupports } from '../../app/context';

const hasAppSupport = ( supports: AppConfig[ 'supports' ], feature: keyof MeSupports ) => {
	return supports.me && supports.me[ feature ];
};

export const MeMenuSidebar = () => {
	const { supports } = useAppContext();

	return (
		<SidebarMenu>
			<SidebarMenuItem icon={ commentAuthorAvatar } to="/me/profile">
				{ __( 'Profile' ) }
			</SidebarMenuItem>
			<SidebarMenuItem icon={ settings } to="/me/preferences">
				{ __( 'Preferences' ) }
			</SidebarMenuItem>
			<SidebarMenuItem icon={ payment } to="/me/billing">
				{ __( 'Billing' ) }
			</SidebarMenuItem>
			<SidebarMenuItem icon={ lock } to="/me/security">
				{ __( 'Security' ) }
			</SidebarMenuItem>
			{ hasAppSupport( supports, 'privacy' ) && (
				<SidebarMenuItem icon={ seen } to="/me/privacy">
					{ __( 'Privacy' ) }
				</SidebarMenuItem>
			) }
			{ supports.notifications && (
				<SidebarMenuItem icon={ bell } to="/me/notifications">
					{ __( 'Notifications' ) }
				</SidebarMenuItem>
			) }
			{ supports.reader && (
				<SidebarMenuItem icon={ notAllowed } to="/me/blocked-sites">
					{ __( 'Blocked sites' ) }
				</SidebarMenuItem>
			) }
			{ isEnabled( 'mcp-settings' ) && (
				<SidebarMenuItem icon={ starEmpty } to="/me/mcp">
					{ __( 'MCP' ) }
				</SidebarMenuItem>
			) }
			{ hasAppSupport( supports, 'apps' ) && (
				<SidebarMenuItem icon={ buttons } to="/me/apps">
					{ __( 'Apps' ) }
				</SidebarMenuItem>
			) }
		</SidebarMenu>
	);
};

const MeMenu = () => {
	const { supports } = useAppContext();

	return (
		<ResponsiveMenu prefix={ <MenuDivider /> }>
			<ResponsiveMenu.Item to="/me/profile">{ __( 'Profile' ) }</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to="/me/preferences">{ __( 'Preferences' ) }</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to="/me/billing">{ __( 'Billing' ) }</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to="/me/security">{ __( 'Security' ) }</ResponsiveMenu.Item>
			{ hasAppSupport( supports, 'privacy' ) && (
				<ResponsiveMenu.Item to="/me/privacy">{ __( 'Privacy' ) }</ResponsiveMenu.Item>
			) }
			{ supports.notifications && (
				<ResponsiveMenu.Item to="/me/notifications">{ __( 'Notifications' ) }</ResponsiveMenu.Item>
			) }
			{ supports.reader && (
				<ResponsiveMenu.Item to="/me/blocked-sites">{ __( 'Blocked sites' ) }</ResponsiveMenu.Item>
			) }
			{ isEnabled( 'mcp-settings' ) && (
				<ResponsiveMenu.Item to="/me/mcp">{ __( 'MCP' ) }</ResponsiveMenu.Item>
			) }
			{ hasAppSupport( supports, 'apps' ) && (
				<ResponsiveMenu.Item to="/me/apps">{ __( 'Apps' ) }</ResponsiveMenu.Item>
			) }
		</ResponsiveMenu>
	);
};

export default MeMenu;
