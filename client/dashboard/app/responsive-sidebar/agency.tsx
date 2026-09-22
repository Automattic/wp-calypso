import { agencyQuery, activeAgencyQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import {
	home,
	globe,
	layout,
	megaphone,
	pages,
	plugins,
	tag,
	currencyDollar,
	people,
} from '@wordpress/icons';
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

	return (
		<>
			<SidebarMenuItem icon={ home } to="/overview">
				{ __( 'Home' ) }
			</SidebarMenuItem>
			{ supports.agency.sites && canAccess( agencySitesRoute ) && (
				<SidebarMenuItem icon={ layout } to="/sites">
					{ __( 'Sites' ) }
				</SidebarMenuItem>
			) }
			{ /* Plugins lives in the WP.com dashboard; the gate mirrors the classic app's. */ }
			{ supports.agency.plugins && hasAnyCapability( capabilities, 'a4a_read_managed_sites' ) && (
				<SidebarMenuItem icon={ plugins } href={ buildDashboardLink( 'dotcom', '/plugins' ) }>
					{ __( 'Plugins' ) }
				</SidebarMenuItem>
			) }
			{ supports.agency.team && canAccess( agencyTeamRoute ) && (
				<SidebarMenuItem icon={ people } to="/team">
					{ __( 'Team' ) }
				</SidebarMenuItem>
			) }
			{ ( canAccessTiers || canAccessPartnerDirectory ) && (
				<SidebarExpandableMenuItem
					label={ __( 'Agency' ) }
					icon={ globe }
					to={ canAccessTiers ? '/agency/tiers' : '/agency/partner-directory' }
				>
					{ canAccessTiers && (
						<SidebarMenuItem to="/agency/tiers">{ __( 'Tiers' ) }</SidebarMenuItem>
					) }
					{ canAccessPartnerDirectory && (
						<SidebarMenuItem to="/agency/partner-directory">
							{ __( 'Partner Directories' ) }
						</SidebarMenuItem>
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
			{ ( canAccessLearn || canAccessMcp || canAccessDevTools ) && (
				<SidebarExpandableMenuItem label={ __( 'Resources' ) } icon={ pages } to="/resources">
					{ canAccessLearn && (
						<SidebarMenuItem to="/resources/learn">{ __( 'Learn' ) }</SidebarMenuItem>
					) }
					{ canAccessMcp && (
						<SidebarMenuItem to="/resources/ai-mcp">{ __( 'AI and MCP' ) }</SidebarMenuItem>
					) }
					{ canAccessDevTools && (
						<SidebarMenuItem to="/resources/dev-tools">{ __( 'Developer tools' ) }</SidebarMenuItem>
					) }
				</SidebarExpandableMenuItem>
			) }
			{ canAccessEarn && (
				<SidebarExpandableMenuItem label={ __( 'Earn' ) } icon={ currencyDollar } to="/earn">
					{ canAccess( earnReferralsRoute ) && (
						<SidebarMenuItem to="/earn/referrals">{ __( 'Referrals' ) }</SidebarMenuItem>
					) }
					{ canAccess( earnWooPaymentsRoute ) && (
						<SidebarMenuItem to="/earn/woopayments">{ __( 'WooPayments' ) }</SidebarMenuItem>
					) }
					{ canAccess( earnMigrationsRoute ) && (
						<SidebarMenuItem to="/earn/migrations">{ __( 'Migrations' ) }</SidebarMenuItem>
					) }
					{ canAccess( earnPayoutSettingsRoute ) && (
						<SidebarMenuItem to="/earn/payout-settings">
							{ __( 'Payout settings' ) }
						</SidebarMenuItem>
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
