import { __ } from '@wordpress/i18n';
import { useAppContext } from '../app/context';
import Menu from '../menu';

function PrimaryMenu() {
	const { supports } = useAppContext();

	return (
		<Menu>
			{ supports.overview && <Menu.Item to="/overview">{ __( 'Overview' ) }</Menu.Item> }
			{ supports.sites && <Menu.Item to="/sites">{ __( 'Sites' ) }</Menu.Item> }
			{ supports.domains && <Menu.Item to="/domains">{ __( 'Domains' ) }</Menu.Item> }
			{ supports.emails && <Menu.Item to="/emails">{ __( 'Emails' ) }</Menu.Item> }
		</Menu>
	);
}

export default PrimaryMenu;
