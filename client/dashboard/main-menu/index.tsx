import { __ } from '@wordpress/i18n';
import { useAppContext } from '../app/context';
import Menu from '../menu';

function MainMenu() {
	const { appType } = useAppContext();

	return (
		<Menu>
			<Menu.Item to="/sites">{ __( 'Sites' ) }</Menu.Item>
			{ appType === 'dotcom' && (
				<>
					<Menu.Item to="/domains">{ __( 'Domains' ) }</Menu.Item>
					<Menu.Item to="/emails">{ __( 'Emails' ) }</Menu.Item>
				</>
			) }
		</Menu>
	);
}

export default MainMenu;
