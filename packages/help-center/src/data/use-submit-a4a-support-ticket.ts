import { useMutation } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

type Ticket = {
	name: string;
	email: string;
	message: string;
	product: string;
	agency_id: number | undefined;
	site?: string;
	no_of_sites?: number;
	contact_type?: string;
	pressable_id?: number;
	tags?: string[];
};

export function useSubmitA4ATicketMutation() {
	return useMutation( {
		mutationFn: ( ticket: Ticket ) => {
			let path = '/agency/help/zendesk/create-ticket';

			if ( ticket.product === 'pressable' && ticket.contact_type === 'support' ) {
				path = '/agency/help/pressable/support';
			}

			// Get OAuth token from localStorage
			const token = localStorage.getItem( 'wpcom_token' );

			return wpcomRequest( {
				path,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: ticket,
				token: token ? JSON.parse( token ) : undefined,
			} );
		},
	} );
}
