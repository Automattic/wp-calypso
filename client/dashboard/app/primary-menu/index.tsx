import { __ } from '@wordpress/i18n';
import ResponsiveMenu from '../../components/responsive-menu';
import { useAppContext } from '../context';

function PrimaryMenu() {
	const { supports } = useAppContext();

	return (
		<ResponsiveMenu>
			{ supports.overview && (
				<ResponsiveMenu.Item to="/overview">{ __( 'Overview' ) }</ResponsiveMenu.Item>
			) }
			{ supports.sites && <ResponsiveMenu.Item to="/sites">{ __( 'Sites' ) }</ResponsiveMenu.Item> }
			{ supports.ciabSites && (
				<ResponsiveMenu.Item to="/sites">{ __( 'Stores' ) }</ResponsiveMenu.Item>
			) }
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
				<ResponsiveMenu.Item href="/themes" target="_blank" rel="noopener noreferrer">
					{ __( 'Themes' ) }
				</ResponsiveMenu.Item>
			) }
		</ResponsiveMenu>
	);
}

export default PrimaryMenu;
