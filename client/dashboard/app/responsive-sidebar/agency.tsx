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
			{ supports.agency && ( supports.agency.tiers || supports.agency.amplify ) && (
				<SidebarExpandableMenuItem
					label={ __( 'Agency' ) }
					icon={ globe }
					to={ supports.agency.tiers ? '/agency/tiers' : '/agency/amplify' }
				>
					{ supports.agency.tiers && (
						<SidebarMenuItem to="/agency/tiers">{ __( 'Tiers' ) }</SidebarMenuItem>
					) }
					{ supports.agency.amplify && (
						<SidebarMenuItem to="/agency/amplify">{ __( 'Amplify' ) }</SidebarMenuItem>
					) }
				</SidebarExpandableMenuItem>
			) }
		</>
	);
}
