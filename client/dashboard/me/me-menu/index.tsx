import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import MenuDivider from '../../components/menu-divider';
import ResponsiveMenu from '../../components/responsive-menu';
import type { AppConfig, MeSupports } from '../../app/context';

const hasAppSupport = ( supports: AppConfig[ 'supports' ], feature: keyof MeSupports ) => {
	return supports.me && supports.me[ feature ];
};

const MeMenu = () => {
	const { supports } = useAppContext();

	return (
		<ResponsiveMenu prefix={ <MenuDivider /> }>
			<ResponsiveMenu.Item to="/me/account">{ __( 'Profile' ) }</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to="/me/preferences">{ __( 'Preferences' ) }</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to="/me/billing">{ __( 'Billing' ) }</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to="/me/security">{ __( 'Security' ) }</ResponsiveMenu.Item>
			{ supports.notifications && (
				<ResponsiveMenu.Item to="/me/notifications">{ __( 'Notifications' ) }</ResponsiveMenu.Item>
			) }
			{ hasAppSupport( supports, 'apps' ) && (
				<ResponsiveMenu.Item to="/me/apps">{ __( 'Apps' ) }</ResponsiveMenu.Item>
			) }
		</ResponsiveMenu>
	);
};

export default MeMenu;
