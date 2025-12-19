import { __ } from '@wordpress/i18n';
import ResponsiveMenu from '../../components/responsive-menu';
import { wpcomLink } from '../../utils/link';
import { useAppContext } from '../context';

function PrimaryMenu() {
	const { supports } = useAppContext();

	return (
		<ResponsiveMenu>
			{ supports.sites && <ResponsiveMenu.Item to="/sites">{ __( 'Sites' ) }</ResponsiveMenu.Item> }
			{ supports.domains && (
				<ResponsiveMenu.Item to="/domains">{ __( 'Domains' ) }</ResponsiveMenu.Item>
			) }
			{ supports.emails && (
				<ResponsiveMenu.Item to="/emails">{ __( 'Emails' ) }</ResponsiveMenu.Item>
			) }
			{ supports.plugins && (
				<ResponsiveMenu.Item to="/plugins/manage">{ __( 'Plugins' ) }</ResponsiveMenu.Item>
			) }
			{ supports.themes && (
				<ResponsiveMenu.Item
					href={ wpcomLink( '/themes' ) }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ __( 'Themes' ) }
				</ResponsiveMenu.Item>
			) }
		</ResponsiveMenu>
	);
}

export default PrimaryMenu;
