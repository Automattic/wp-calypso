import { agencyQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { home, globe, pages, tag } from '@wordpress/icons';
import { SidebarExpandableMenuItem, SidebarMenuItem } from '../../components/sidebar';
import { useAppContext } from '../context';

export default function AgencySidebar() {
	const { supports } = useAppContext();
	const { data: agency } = useSuspenseQuery( agencyQuery() );
	if ( agency.isClientUser ) {
		return null;
	}

	return (
		<>
			<SidebarMenuItem icon={ home } to="/overview">
				{ __( 'Home' ) }
			</SidebarMenuItem>
			{ supports.agency && supports.agency.tiers && (
				<SidebarExpandableMenuItem label={ __( 'Agency' ) } icon={ globe } to="/agency/tiers">
					<SidebarMenuItem to="/agency/tiers">{ __( 'Tiers' ) }</SidebarMenuItem>
				</SidebarExpandableMenuItem>
			) }
			{ supports.agency && supports.agency.exclusiveOffers && (
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
			{ supports.agency && ( supports.agency.learn || supports.agency.mcp ) && (
				<SidebarExpandableMenuItem label={ __( 'Resources' ) } icon={ pages } to="/resources">
					{ supports.agency.learn && (
						<SidebarMenuItem to="/resources/learn">{ __( 'Learn' ) }</SidebarMenuItem>
					) }
					{ supports.agency.mcp && (
						<SidebarMenuItem to="/resources/ai-mcp">{ __( 'MCP' ) }</SidebarMenuItem>
					) }
				</SidebarExpandableMenuItem>
			) }
		</>
	);
}
