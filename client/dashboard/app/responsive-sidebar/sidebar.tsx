import { __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { brush, envelope, globe, layout, plugins } from '@wordpress/icons';
import { useRef } from 'react';
import RouterLinkButton from '../../components/router-link-button';
import { SidebarExpandableMenuItem, SidebarMenu, SidebarMenuItem } from '../../components/sidebar';
import SidebarNavigator from '../../components/sidebar-navigator';
import DomainSidebar from '../../domains/domain-sidebar';
import MeSidebar from '../../me/me-sidebar';
import SiteSidebar from '../../sites/site-sidebar';
import { wpcomLink } from '../../utils/link';
import { useAnalytics } from '../analytics';
import { useAppContext } from '../context';
import { useSidebarScrollSync } from './use-sidebar-scroll-sync';

import './sidebar.scss';

export default function Sidebar( { scrollSyncEnabled = false }: { scrollSyncEnabled?: boolean } ) {
	const { Logo, name } = useAppContext();
	const { recordTracksEvent } = useAnalytics();
	const sidebarRef = useRef< HTMLDivElement >( null );
	const navigatorRef = useRef< HTMLDivElement >( null );

	useSidebarScrollSync( { enabled: scrollSyncEnabled, sidebarRef, navigatorRef } );

	return (
		<div ref={ sidebarRef } className="dashboard-responsive-sidebar__sidebar">
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
			<SidebarNavigator ref={ navigatorRef }>
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
