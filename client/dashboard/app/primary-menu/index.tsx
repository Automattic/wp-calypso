import { __experimentalHStack as HStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Menu from '../../components/menu';
import { useAppContext } from '../context';

function PrimaryMenu() {
	const { supports } = useAppContext();

	return (
		<Menu>
			{ supports.overview && <Menu.Item to="/overview">{ __( 'Overview' ) }</Menu.Item> }
			{ supports.sites && <Menu.Item to="/sites">{ __( 'Sites' ) }</Menu.Item> }
			{ supports.domains && <Menu.Item to="/domains">{ __( 'Domains' ) }</Menu.Item> }
			{ supports.emails && <Menu.Item to="/emails">{ __( 'Emails' ) }</Menu.Item> }
			{ supports.plugins && <Menu.Item to="/plugins/manage">{ __( 'Plugins' ) }</Menu.Item> }
			{ supports.themes && (
				<Button
					href="/themes"
					className="dashboard-menu__item"
					variant="tertiary"
					target="_blank"
					rel="noopener noreferrer"
				>
					<HStack justify="flex-start" spacing={ 1 }>
						<span>{ __( 'Themes' ) }</span>
						<span aria-label={ __( '(opens in a new tab)' ) }>&#8599;</span>
					</HStack>
				</Button>
			) }
		</Menu>
	);
}

export default PrimaryMenu;
