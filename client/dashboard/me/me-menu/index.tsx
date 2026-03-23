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
import { SidebarMenu, SidebarMenuItem } from '../../components/sidebar';
import type { AppConfig, MeSupports } from '../../app/context';

const hasAppSupport = ( supports: AppConfig[ 'supports' ], feature: keyof MeSupports ) => {
	return supports.me && supports.me[ feature ];
};

const MeMenu = () => {
	const { supports } = useAppContext();

	return (
		<SidebarMenu>
			<SidebarMenuItem icon={ commentAuthorAvatar } to="/me/profile">
				{ __( 'Account' ) }
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

export default MeMenu;
