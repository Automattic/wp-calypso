import { agencyQuery, activeAgencyQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { home, globe, layout, megaphone, pages, tag, currencyDollar } from '@wordpress/icons';
import { SidebarExpandableMenuItem, SidebarMenuItem } from '../../components/sidebar';
import { a4aLink } from '../../utils/link';
import { useAppContext } from '../context';
import {
	agencyPartnerDirectoryRoute,
	agencySitesRoute,
	agencyTeamRoute,
	agencyTiersRoute,
	devToolsRoute,
	earnMigrationsRoute,
	earnPayoutSettingsRoute,
	earnReferralsRoute,
	earnSectionRoutes,
	earnWooPaymentsRoute,
	hasAnyCapability,
	isMarketplaceSectionAvailable,
	isRouteAllowedByCapabilities,
	learnRoute,
	marketplaceSections,
	mcpRoute,
} from '../router/agency';
import { buildDashboardLink } from '../routing';
import type { AnyRoute } from '@tanstack/react-router';

export default function AgencySidebar() {
	const { supports } = useAppContext();
	const { data: agency } = useSuspenseQuery( agencyQuery() );
	const { data: activeAgency } = useSuspenseQuery( activeAgencyQuery() );
	if ( agency.isClientUser || ! supports.agency ) {
		return null;
	}
	const agencySupports = supports.agency;

	// Menu items are hidden rather than left to bounce off the route guard in
	// `agencyRoute.beforeLoad`, which would redirect to /overview with an error.
	const capabilities = activeAgency?.user?.capabilities ?? [];
	const canAccess = ( route: AnyRoute ) => isRouteAllowedByCapabilities( route, capabilities );

	const canAccessTiers = !! supports.agency.tiers && canAccess( agencyTiersRoute );
	const canAccessPartnerDirectory =
		!! ( supports.agency.partnerDirectory && activeAgency?.partner_directory?.allowed ) &&
		canAccess( agencyPartnerDirectoryRoute );
	const accessibleMarketplaceSections = marketplaceSections.filter( ( section ) =>
		isMarketplaceSectionAvailable( section, agencySupports, capabilities )
	);
	const canAccessLearn = !! supports.agency.learn && canAccess( learnRoute );
	const canAccessMcp = !! supports.agency.mcp && canAccess( mcpRoute );
	const canAccessAmplify =
		!! ( supports.agency.amplify && activeAgency?.amplify?.allowed ) &&
		hasAnyCapability( capabilities, 'a4a_read_amplify' );
	const canAccessDevTools = !! supports.agency.devTools && canAccess( devToolsRoute );
	const canAccessEarn = !! supports.agency.earn && earnSectionRoutes.some( canAccess );
	const canAccessMigrations = !! supports.agency.earn && canAccess( earnMigrationsRoute );
	const canAccessSites = !! supports.agency.sites && canAccess( agencySitesRoute );
	const canAccessPlugins =
		!! supports.agency.plugins && hasAnyCapability( capabilities, 'a4a_read_managed_sites' );
	const canAccessTeam = !! supports.agency.team && canAccess( agencyTeamRoute );

	return (
		<>
			<SidebarMenuItem icon={ home } to="/overview">
				{ __( 'Home' ) }
			</SidebarMenuItem>
			{ ( canAccessSites || canAccessPlugins || canAccessDevTools || canAccessMigrations ) && (
				<SidebarExpandableMenuItem label={ __( 'Client work' ) } icon={ layout } to="/client-work">
					{ canAccessSites && (
						<SidebarMenuItem to="/client-work/sites">{ __( 'Sites' ) }</SidebarMenuItem>
					) }
					{ /* Plugins lives in the WP.com dashboard; the gate mirrors the classic app's. */ }
					{ canAccessPlugins && (
						<SidebarMenuItem href={ buildDashboardLink( 'dotcom', '/plugins' ) }>
							{ __( 'Plugins' ) }
						</SidebarMenuItem>
					) }
					{ canAccessDevTools && (
						<SidebarMenuItem to="/client-work/dev-tools">{ __( 'Dev tools' ) }</SidebarMenuItem>
					) }
					{ canAccessMigrations && (
						<SidebarMenuItem to="/client-work/migrations">{ __( 'Migrations' ) }</SidebarMenuItem>
					) }
				</SidebarExpandableMenuItem>
			) }
			{ accessibleMarketplaceSections.length > 0 && (
				<SidebarExpandableMenuItem label={ __( 'Marketplace' ) } icon={ tag } to="/marketplace">
					{ accessibleMarketplaceSections.map( ( { route, label } ) => (
						<SidebarMenuItem key={ route.fullPath } to={ route.fullPath }>
							{ label() }
						</SidebarMenuItem>
					) ) }
				</SidebarExpandableMenuItem>
			) }
			{ ( canAccessLearn || canAccessMcp ) && (
				<SidebarExpandableMenuItem label={ __( 'Resources' ) } icon={ pages } to="/resources">
					{ canAccessLearn && (
						<SidebarMenuItem to="/resources/learn">{ __( 'Learn' ) }</SidebarMenuItem>
					) }
					{ canAccessMcp && (
						<SidebarMenuItem to="/resources/ai-mcp">{ __( 'AI and MCP' ) }</SidebarMenuItem>
					) }
				</SidebarExpandableMenuItem>
			) }
			{ canAccessEarn && (
				<SidebarExpandableMenuItem
					label={ __( 'Earnings' ) }
					icon={ currencyDollar }
					to="/earnings"
				>
					{ canAccess( earnReferralsRoute ) && (
						<SidebarMenuItem to="/earnings/referrals">{ __( 'Referrals' ) }</SidebarMenuItem>
					) }
					{ canAccess( earnWooPaymentsRoute ) && (
						<SidebarMenuItem to="/earnings/woopayments">{ __( 'WooPayments' ) }</SidebarMenuItem>
					) }
					{ canAccess( earnPayoutSettingsRoute ) && (
						<SidebarMenuItem to="/earnings/payout-settings">
							{ __( 'Payout settings' ) }
						</SidebarMenuItem>
					) }
				</SidebarExpandableMenuItem>
			) }
			{ ( canAccessTeam || canAccessPartnerDirectory || canAccessTiers ) && (
				<SidebarExpandableMenuItem label={ __( 'Agency' ) } icon={ globe } to="/agency">
					{ canAccessTeam && <SidebarMenuItem to="/agency/team">{ __( 'Team' ) }</SidebarMenuItem> }
					{ canAccessPartnerDirectory && (
						<SidebarMenuItem to="/agency/partner-directory">
							{ __( 'Partner Directories' ) }
						</SidebarMenuItem>
					) }
					{ canAccessTiers && (
						<SidebarMenuItem to="/agency/tiers">{ __( 'Agency tier' ) }</SidebarMenuItem>
					) }
				</SidebarExpandableMenuItem>
			) }
			{ canAccessAmplify && (
				<SidebarMenuItem icon={ megaphone } href={ a4aLink( '/amplify' ) }>
					{ __( 'Amplify' ) }
				</SidebarMenuItem>
			) }
		</>
	);
}
