import { __ } from '@wordpress/i18n';
import { useAppContext } from '../app/context';
import Menu from '../menu';

const MeMenu = () => {
	const { supports } = useAppContext();

	return (
		<Menu>
			<Menu.Item to="/me/profile">{ __( 'Profile' ) }</Menu.Item>
			<Menu.Item to="/me/billing">{ __( 'Billing' ) }</Menu.Item>
			<Menu.Item to="/me/security">{ __( 'Security' ) }</Menu.Item>
			<Menu.Item to="/me/privacy">{ __( 'Privacy' ) }</Menu.Item>
			{ supports.notifications && (
				<Menu.Item to="/me/notifications">{ __( 'Notifications' ) }</Menu.Item>
			) }
		</Menu>
	);
};

export default MeMenu;
