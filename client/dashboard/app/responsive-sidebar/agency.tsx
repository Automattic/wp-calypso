import { agencyQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { home, globe } from '@wordpress/icons';
import { SidebarExpandableMenuItem, SidebarMenuItem } from '../../components/sidebar';
import { useAppContext } from '../context';

export default function AgencySidebar() {
	const { data: agency } = useSuspenseQuery( agencyQuery() );
	const { supports } = useAppContext();
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
		</>
	);
}
