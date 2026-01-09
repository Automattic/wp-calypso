import { __ } from '@wordpress/i18n';
import MenuDivider from '../../components/menu-divider';
import ResponsiveMenu from '../../components/responsive-menu';
import { wpcomLink } from '../../utils/link';

const PluginsMenu = () => {
	return (
		<ResponsiveMenu prefix={ <MenuDivider /> }>
			<ResponsiveMenu.Item to="/plugins/manage">{ __( 'Manage plugins' ) }</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to="/plugins/scheduled-updates">
				{ __( 'Scheduled updates' ) }
			</ResponsiveMenu.Item>
			<ResponsiveMenu.Item
				href={ wpcomLink( '/plugins' ) }
				target="_blank"
				rel="noopener noreferrer"
			>
				{ __( 'Browse plugins' ) }
			</ResponsiveMenu.Item>
		</ResponsiveMenu>
	);
};

export default PluginsMenu;
