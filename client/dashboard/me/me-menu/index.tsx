import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import ResponsiveMenu from '../../components/responsive-menu';
import type { AppConfig, MeSupports } from '../../app/context';

const hasAppSupport = ( supports: AppConfig[ 'supports' ], feature: keyof MeSupports ) => {
	return supports.me && supports.me[ feature ];
};

const MeMenu = () => {
	const { supports } = useAppContext();

	return (
		<ResponsiveMenu>
			<ResponsiveMenu.Item to="/me/profile">{ __( 'Profile' ) }</ResponsiveMenu.Item>
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
			{ hasAppSupport( supports, 'apps' ) && (
				<ResponsiveMenu.Item to="/me/apps">{ __( 'Apps' ) }</ResponsiveMenu.Item>
			) }
		</ResponsiveMenu>
	);
};

export default MeMenu;
