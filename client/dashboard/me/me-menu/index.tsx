import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../app/context';
import ResponsiveMenu from '../../components/responsive-menu';

const MeMenu = () => {
	const { supports } = useAppContext();

	return (
		<ResponsiveMenu>
			<ResponsiveMenu.Item to="/me/profile">{ __( 'Profile' ) }</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to="/me/billing">{ __( 'Billing' ) }</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to="/me/security">{ __( 'Security' ) }</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to="/me/privacy">{ __( 'Privacy' ) }</ResponsiveMenu.Item>
			{ supports.notifications && (
				<ResponsiveMenu.Item to="/me/notifications">{ __( 'Notifications' ) }</ResponsiveMenu.Item>
			) }
		</ResponsiveMenu>
	);
};

export default MeMenu;
