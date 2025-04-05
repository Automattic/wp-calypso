import { __ } from '@wordpress/i18n';
import Menu from '../menu';

function MainMenu() {
	return (
		<Menu>
			<Menu.Item to="/sites">{ __( 'Sites' ) }</Menu.Item>
			<Menu.Item to="/domains">{ __( 'Domains' ) }</Menu.Item>
			<Menu.Item to="/emails">{ __( 'Emails' ) }</Menu.Item>
		</Menu>
	);
}

export default MainMenu;
