import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import MenuDivider from '../../components/menu-divider';
import ResponsiveMenu from '../../components/responsive-menu';
import { wpcomLink } from '../../utils/link';

const PluginsMenu = () => {
	const isRedesignEnabled = isEnabled( 'marketplace-redesign' );
	const browsePluginsLabel = __( 'Browse plugins' );

	return (
		<ResponsiveMenu prefix={ <MenuDivider /> }>
			<ResponsiveMenu.Item to="/plugins/manage">{ __( 'Manage plugins' ) }</ResponsiveMenu.Item>
			<ResponsiveMenu.Item to="/plugins/scheduled-updates">
				{ __( 'Scheduled updates' ) }
			</ResponsiveMenu.Item>
			{ isRedesignEnabled ? (
				<Button
					className="dashboard-menu__item"
					variant="tertiary"
					href={ wpcomLink( '/plugins' ) }
				>
					{ browsePluginsLabel }
				</Button>
			) : (
				<ResponsiveMenu.Item
					href={ wpcomLink( '/plugins' ) }
					target="_blank"
					rel="noopener noreferrer"
				>
					{ browsePluginsLabel }
				</ResponsiveMenu.Item>
			) }
		</ResponsiveMenu>
	);
};

export default PluginsMenu;
