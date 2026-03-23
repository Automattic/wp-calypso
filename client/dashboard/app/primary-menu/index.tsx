import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { brush, copy, envelope, globe, plugins } from '@wordpress/icons';
import ResponsiveMenu from '../../components/responsive-menu';
import { SidebarExpandableMenuItem, SidebarMenu, SidebarMenuItem } from '../../components/sidebar';
import { wpcomLink } from '../../utils/link';
import { useAppContext } from '../context';

export function PrimaryMenuSidebar() {
	const { supports } = useAppContext();

	return (
		<SidebarMenu>
			{ supports.sites && (
				<SidebarMenuItem icon={ copy } to="/sites">
					{ __( 'Sites' ) }
				</SidebarMenuItem>
			) }
			{ supports.domains && (
				<SidebarMenuItem icon={ globe } to="/domains">
					{ __( 'Domains' ) }
				</SidebarMenuItem>
			) }
			{ supports.emails && (
				<SidebarMenuItem icon={ envelope } to="/emails">
					{ __( 'Emails' ) }
				</SidebarMenuItem>
			) }
			{ supports.plugins && (
				<SidebarExpandableMenuItem label={ __( 'Plugins' ) } icon={ plugins } to="/plugins">
					<SidebarMenuItem to="/plugins/manage">{ __( 'Manage plugins' ) }</SidebarMenuItem>
					<SidebarMenuItem to="/plugins/scheduled-updates">
						{ __( 'Scheduled updates' ) }
					</SidebarMenuItem>
					<SidebarMenuItem
						href={ wpcomLink( '/plugins' ) }
						target="_blank"
						rel="noopener noreferrer"
					>
						<HStack justify="flex-start" spacing={ 1 }>
							<span>{ __( 'Browse plugins' ) }</span>
							<span aria-label={ __( '(opens in a new tab)' ) }>&#8599;</span>
						</HStack>
					</SidebarMenuItem>
				</SidebarExpandableMenuItem>
			) }
			{ supports.themes && (
				<SidebarMenuItem
					icon={ brush }
					href={ wpcomLink( '/themes' ) }
					target="_blank"
					rel="noopener noreferrer"
				>
					<HStack justify="flex-start" spacing={ 1 }>
						<span>{ __( 'Themes' ) }</span>
						<span aria-label={ __( '(opens in a new tab)' ) }>&#8599;</span>
					</HStack>
				</SidebarMenuItem>
			) }
		</SidebarMenu>
	);
}

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
