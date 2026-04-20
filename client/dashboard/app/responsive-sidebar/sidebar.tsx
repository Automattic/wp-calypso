import { __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { brush, envelope, globe, layout, plugins } from '@wordpress/icons';
import { menuDot } from '../../components/icons';
import RouterLinkButton from '../../components/router-link-button';
import { SidebarExpandableMenuItem, SidebarMenu, SidebarMenuItem } from '../../components/sidebar';
import SidebarNavigator from '../../components/sidebar-navigator';
import DomainSidebar from '../../domains/domain-sidebar';
import MeSidebar from '../../me/me-sidebar';
import SiteSidebar from '../../sites/site-sidebar';
import { wpcomLink } from '../../utils/link';
import { useAnalytics } from '../analytics';
import { useAppContext } from '../context';

import './sidebar.scss';

export default function Sidebar() {
	const { Logo, name } = useAppContext();
	const { recordTracksEvent } = useAnalytics();

	return (
		<div className="dashboard-responsive-sidebar__sidebar">
			{ Logo && (
				<div className="dashboard-responsive-sidebar__logo">
					<RouterLinkButton
						/* translators: Screen reader text for link to root of the hosting dashboard. "name" is the product name, e.g. WordPress.com */
						aria-label={ sprintf( __( '%(name)s home' ), { name } ) }
						icon={ <Logo /> }
						to="/"
						onClick={ () => {
							recordTracksEvent( 'calypso_dashboard_logo_click' );
						} }
					/>
				</div>
			) }
			<SidebarNavigator>
				<SidebarNavigator.Screen path="/">
					<PrimaryMenuSidebar />
				</SidebarNavigator.Screen>
				<SidebarNavigator.Screen path="/sites/$siteSlug">
					<SiteSidebar />
				</SidebarNavigator.Screen>
				<SidebarNavigator.Screen path="/domains/$domainName">
					<DomainSidebar />
				</SidebarNavigator.Screen>
				<SidebarNavigator.Screen path="/me">
					<MeSidebar />
				</SidebarNavigator.Screen>
			</SidebarNavigator>
		</div>
	);
}

function PrimaryMenuSidebar() {
	const { supports } = useAppContext();

	return (
		<SidebarMenu>
			{ supports.sites && (
				<SidebarMenuItem icon={ layout } to="/sites">
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
					<SidebarMenuItem icon={ menuDot } to="/plugins/manage">
						{ __( 'Manage plugins' ) }
					</SidebarMenuItem>
					<SidebarMenuItem icon={ menuDot } to="/plugins/scheduled-updates">
						{ __( 'Scheduled updates' ) }
					</SidebarMenuItem>
					<SidebarMenuItem
						icon={ menuDot }
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
