import { createHigherOrderComponent } from '@wordpress/compose';
import { useSelector } from 'react-redux';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { useActiveSupportTicketsQuery } from './use-active-support-tickets-query';

const withActiveSupportTickets = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const email = useSelector( getCurrentUserEmail );
		const { data } = useActiveSupportTicketsQuery( email );

		return <Wrapped { ...props } activeSupportTicketCount={ data?.length ?? 0 } />;
	},
	'WithActiveSupportTickets'
);

export default withActiveSupportTickets;
