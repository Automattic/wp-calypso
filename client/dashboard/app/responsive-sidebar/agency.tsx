import { agencyQuery, activeAgencyQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { home, globe, layout, pages, tag, currencyDollar, people } from '@wordpress/icons';
import { SidebarExpandableMenuItem, SidebarMenuItem } from '../../components/sidebar';
import { useAppContext } from '../context';
import {
	agencyPartnerDirectoryRoute,
	agencySitesRoute,
	agencyTeamRoute,
	agencyTiersRoute,
	earnMigrationsRoute,
	earnOverviewRoute,
	earnPayoutSettingsRoute,
	earnReferralsRoute,
	earnWooPaymentsRoute,
	isMarketplaceSectionAvailable,
	isRouteAllowedByCapabilities,
	learnRoute,
	marketplaceSections,
	mcpRoute,
} from '../router/agency';
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
	const canAccessMcp =
		!! ( supports.agency.mcp && activeAgency?.mcp?.allowed ) && canAccess( mcpRoute );
	const canAccessEarn =
		!! supports.agency.earn &&
		[
			earnOverviewRoute,
			earnReferralsRoute,
			earnWooPaymentsRoute,
			earnMigrationsRoute,
			earnPayoutSettingsRoute,
		].some( canAccess );

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
				<SidebarExpandableMenuItem label={ __( 'Earn' ) } icon={ currencyDollar } to="/earn">
					{ canAccess( earnOverviewRoute ) && (
						<SidebarMenuItem to="/earn" activeOptions={ { exact: true } }>
							{ __( 'Overview' ) }
						</SidebarMenuItem>
					) }
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
		</>
	);
}
