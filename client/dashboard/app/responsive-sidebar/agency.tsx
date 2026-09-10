import { agencyQuery, activeAgencyQuery, pendingAgencySitesQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { home, globe, layout, pages, tag, currencyDollar, people } from '@wordpress/icons';
import { hasWpcomLicenseWithoutSite } from '../../agency/sites/need-setup/lib';
import { SidebarExpandableMenuItem, SidebarMenuItem } from '../../components/sidebar';
import { useAppContext } from '../context';
import {
	agencyPartnerDirectoryRoute,
	agencySitesNeedSetupRoute,
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

function SitesLink() {
	return (
		<SidebarMenuItem icon={ layout } to="/sites">
			{ __( 'Sites' ) }
		</SidebarMenuItem>
	);
}

/**
 * Suspends so the item takes its final shape before the menu paints. Swapping
 * the link for an expandable item once the request lands shifts the menu and
 * risks the Google Translate crash described in client/dashboard/AGENTS.md.
 */
function SitesMenuItem( { agencyId }: { agencyId: number } ) {
	const { data: pendingSites } = useSuspenseQuery( pendingAgencySitesQuery( agencyId ) );

	// Mirrors the route guard: without a paid license awaiting a site there is
	// nothing for the Needs setup screen to show.
	if ( ! pendingSites.some( hasWpcomLicenseWithoutSite ) ) {
		return <SitesLink />;
	}

	return (
		<SidebarExpandableMenuItem label={ __( 'Sites' ) } icon={ layout } to="/sites">
			<SidebarMenuItem to="/sites" activeOptions={ { exact: true } }>
				{ __( 'All' ) }
			</SidebarMenuItem>
			<SidebarMenuItem to="/sites/need-setup">{ __( 'Needs setup' ) }</SidebarMenuItem>
		</SidebarExpandableMenuItem>
	);
}

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
			{ supports.agency.sites &&
				canAccess( agencySitesRoute ) &&
				( activeAgency?.id && canAccess( agencySitesNeedSetupRoute ) ? (
					<SitesMenuItem agencyId={ activeAgency.id } />
				) : (
					<SitesLink />
				) ) }
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
