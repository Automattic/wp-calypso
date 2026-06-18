import { agencyQuery, activeAgencyQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { home, globe, layout, pages, tag } from '@wordpress/icons';
import { SidebarExpandableMenuItem, SidebarMenuItem } from '../../components/sidebar';
import { useAppContext } from '../context';

export default function AgencySidebar() {
	const { supports } = useAppContext();
	const { data: agency } = useSuspenseQuery( agencyQuery() );
	const { data: activeAgency } = useSuspenseQuery( activeAgencyQuery() );
	if ( agency.isClientUser || ! supports.agency ) {
		return null;
	}

	const canAccessMcp = !! ( supports.agency.mcp && activeAgency?.mcp?.allowed );

	return (
		<>
			<SidebarMenuItem icon={ home } to="/overview">
				{ __( 'Home' ) }
			</SidebarMenuItem>
			{ supports.agency.sites && (
				<SidebarMenuItem icon={ layout } to="/sites">
					{ __( 'Sites' ) }
				</SidebarMenuItem>
			) }
			{ supports.agency.tiers && (
				<SidebarExpandableMenuItem label={ __( 'Agency' ) } icon={ globe } to="/agency/tiers">
					<SidebarMenuItem to="/agency/tiers">{ __( 'Tiers' ) }</SidebarMenuItem>
				</SidebarExpandableMenuItem>
			) }
			{ supports.agency.exclusiveOffers && (
				<SidebarExpandableMenuItem
					label={ __( 'Marketplace' ) }
					icon={ tag }
					to="/marketplace/exclusive-offers"
				>
					<SidebarMenuItem to="/marketplace/exclusive-offers">
						{ __( 'Exclusive offers' ) }
					</SidebarMenuItem>
				</SidebarExpandableMenuItem>
			) }
			{ ( supports.agency.learn || canAccessMcp ) && (
				<SidebarExpandableMenuItem label={ __( 'Resources' ) } icon={ pages } to="/resources">
					{ supports.agency.learn && (
						<SidebarMenuItem to="/resources/learn">{ __( 'Learn' ) }</SidebarMenuItem>
					) }
					{ canAccessMcp && (
						<SidebarMenuItem to="/resources/ai-mcp">{ __( 'MCP' ) }</SidebarMenuItem>
					) }
				</SidebarExpandableMenuItem>
			) }
		</>
	);
}
