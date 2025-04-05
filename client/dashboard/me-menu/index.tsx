import { __ } from '@wordpress/i18n';
import Menu from '../menu';

const MeMenu = () => {
	return (
		<Menu>
			<Menu.Item to="/me/profile">{ __( 'Profile' ) }</Menu.Item>
			<Menu.Item to="/me/billing">{ __( 'Billing' ) }</Menu.Item>
			<Menu.Item to="/me/security">{ __( 'Security' ) }</Menu.Item>
			<Menu.Item to="/me/privacy">{ __( 'Privacy' ) }</Menu.Item>
			<Menu.Item to="/me/notifications">{ __( 'Notifications' ) }</Menu.Item>
		</Menu>
	);
};

export default MeMenu;
