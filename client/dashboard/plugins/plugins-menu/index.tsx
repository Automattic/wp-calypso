import { __ } from '@wordpress/i18n';
import ResponsiveMenu from '../../components/responsive-menu';

const PluginsMenu = () => {
	return (
		<ResponsiveMenu>
			<ResponsiveMenu.Item to="/plugins/manage" activeOptions={ { exact: true } }>
				{ __( 'Manage plugins' ) }
			</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to="/plugins/scheduled-updates">
				{ __( 'Scheduled updates' ) }
			</ResponsiveMenu.Item>
			<ResponsiveMenu.Item href="/plugins" target="_blank" rel="noopener noreferrer">
				{ __( 'Browse plugins' ) }
			</ResponsiveMenu.Item>
		</ResponsiveMenu>
	);
};

export default PluginsMenu;
