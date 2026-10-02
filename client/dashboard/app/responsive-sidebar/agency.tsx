import { agencyQuery, activeAgencyQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { home, globe, people, tag, trendingUp, currencyDollar } from '@wordpress/icons';
import { SidebarExpandableMenuItem, SidebarMenuItem } from '../../components/sidebar';
import { useAppContext } from '../context';
import {
	agencyPartnerDirectoryRoute,
	agencyAmplifyRoute,
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

	const canAccessSites = !! supports.agency.sites && canAccess( agencySitesRoute );
	const canAccessPlugins =
		!! supports.agency.plugins && hasAnyCapability( capabilities, 'a4a_read_managed_sites' );
	const canAccessDevTools = !! supports.agency.devTools && canAccess( devToolsRoute );
	const canAccessMigrations = !! supports.agency.earn && canAccess( earnMigrationsRoute );
	const canAccessAmplify =
		!! ( supports.agency.amplify && activeAgency?.amplify?.allowed ) &&
		canAccess( agencyAmplifyRoute );
	const accessibleMarketplaceSections = marketplaceSections.filter( ( section ) =>
		isMarketplaceSectionAvailable( section, agencySupports, capabilities )
	);
	const canAccessLibrary = !! supports.agency.learn && canAccess( learnRoute );
	const canAccessPartnerDirectory =
		!! ( supports.agency.partnerDirectory && activeAgency?.partner_directory?.allowed ) &&
		canAccess( agencyPartnerDirectoryRoute );
	const canAccessTiers = !! supports.agency.tiers && canAccess( agencyTiersRoute );
	const canAccessEarn = !! supports.agency.earn && earnSectionRoutes.some( canAccess );
	const canAccessTeam = !! supports.agency.team && canAccess( agencyTeamRoute );
	const canAccessMcp = !! supports.agency.mcp && canAccess( mcpRoute );
	const canAccessBilling =
		!! supports.agency.billing && hasAnyCapability( capabilities, 'a4a_jetpack_licensing' );

	const canAccessClients =
		canAccessSites ||
		canAccessPlugins ||
		canAccessDevTools ||
		canAccessMigrations ||
		canAccessAmplify;
	const canAccessGrow = canAccessLibrary || canAccessPartnerDirectory || canAccessTiers;
	const canAccessAgency = canAccessTeam || canAccessMcp || canAccessBilling;

	return (
		<>
			<SidebarMenuItem icon={ home } to="/overview">
				{ __( 'Home' ) }
			</SidebarMenuItem>
			{ canAccessClients && (
				<SidebarExpandableMenuItem
					label={ __( 'Clients' ) }
					icon={ people }
					to="/sites"
					activePaths={ [ '/dev-tools', '/migrations', '/amplify' ] }
				>
					{ canAccessSites && <SidebarMenuItem to="/sites">{ __( 'Sites' ) }</SidebarMenuItem> }
					{ /* Plugins lives in the WP.com dashboard; the gate mirrors the classic app's. */ }
					{ canAccessPlugins && (
						<SidebarMenuItem href={ buildDashboardLink( 'dotcom', '/plugins' ) }>
							{ __( 'Plugins' ) }
						</SidebarMenuItem>
					) }
					{ canAccessDevTools && (
						<SidebarMenuItem to="/dev-tools">{ __( 'Dev tools' ) }</SidebarMenuItem>
					) }
					{ canAccessMigrations && (
						<SidebarMenuItem to="/migrations">{ __( 'Migrations' ) }</SidebarMenuItem>
					) }
					{ canAccessAmplify && (
						<SidebarMenuItem to="/amplify">{ __( 'Amplify' ) }</SidebarMenuItem>
					) }
				</SidebarExpandableMenuItem>
			) }
			{ accessibleMarketplaceSections.length > 0 && (
				<SidebarExpandableMenuItem
					label={ __( 'Marketplace' ) }
					icon={ tag }
					to="/marketplace"
					activePaths={ accessibleMarketplaceSections.map( ( { route } ) => route.fullPath ) }
				>
					{ accessibleMarketplaceSections.map( ( { route, label } ) => (
						<SidebarMenuItem key={ route.fullPath } to={ route.fullPath }>
							{ label() }
						</SidebarMenuItem>
					) ) }
				</SidebarExpandableMenuItem>
			) }
			{ canAccessGrow && (
				<SidebarExpandableMenuItem
					label={ __( 'Grow' ) }
					icon={ trendingUp }
					to="/library"
					activePaths={ [ '/partner-directory', '/tiers' ] }
				>
					{ canAccessLibrary && (
						<SidebarMenuItem to="/library">{ __( 'Library' ) }</SidebarMenuItem>
					) }
					{ canAccessPartnerDirectory && (
						<SidebarMenuItem to="/partner-directory">
							{ __( 'Partner Directories' ) }
						</SidebarMenuItem>
					) }
					{ canAccessTiers && (
						<SidebarMenuItem to="/tiers">{ __( 'Agency tier' ) }</SidebarMenuItem>
					) }
				</SidebarExpandableMenuItem>
			) }
			{ canAccessEarn && (
				<SidebarExpandableMenuItem
					label={ __( 'Earn' ) }
					icon={ currencyDollar }
					to="/referrals"
					activePaths={ [ '/woopayments', '/payout-settings' ] }
				>
					{ canAccess( earnReferralsRoute ) && (
						<SidebarMenuItem to="/referrals">{ __( 'Referrals' ) }</SidebarMenuItem>
					) }
					{ canAccess( earnWooPaymentsRoute ) && (
						<SidebarMenuItem to="/woopayments">{ __( 'WooPayments' ) }</SidebarMenuItem>
					) }
					{ canAccess( earnPayoutSettingsRoute ) && (
						<SidebarMenuItem to="/payout-settings">{ __( 'Payout settings' ) }</SidebarMenuItem>
					) }
				</SidebarExpandableMenuItem>
			) }
			{ canAccessAgency && (
				<SidebarExpandableMenuItem label={ __( 'Agency' ) } icon={ globe } to="/agency">
					{ canAccessTeam && <SidebarMenuItem to="/agency/team">{ __( 'Team' ) }</SidebarMenuItem> }
					{ canAccessMcp && (
						<SidebarMenuItem to="/agency/ai">{ __( 'AI and MCP' ) }</SidebarMenuItem>
					) }
					{ /* Billing lives in the WP.com dashboard. */ }
					{ canAccessBilling && (
						<SidebarMenuItem href={ buildDashboardLink( 'dotcom', '/me/billing' ) }>
							{ __( 'Billing' ) }
						</SidebarMenuItem>
					) }
				</SidebarExpandableMenuItem>
			) }
		</>
	);
}
