import { agencyQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { home } from '@wordpress/icons';
import { SidebarMenuItem } from '../../components/sidebar';

export default function AgencyClientSidebar() {
	const { data: agency } = useSuspenseQuery( agencyQuery() );
	if ( ! agency.isClientUser ) {
		return null;
	}

	return (
		<SidebarMenuItem icon={ home } to="/client/subscriptions">
			{ __( 'Subscriptions' ) }
		</SidebarMenuItem>
	);
}
