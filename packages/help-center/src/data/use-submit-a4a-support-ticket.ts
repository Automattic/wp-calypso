import { useMutation } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

type Ticket = {
	name: string;
	email: string;
	message: string;
	product: string;
	agency_id: number | undefined;
	site?: string;
	contact_type?: string;
	pressable_id?: number;
};

export function useSubmitA4ATicketMutation() {
	return useMutation( {
		mutationFn: ( ticket: Ticket ) => {
			let path = '/agency/help/zendesk/create-ticket';

			if ( ticket.product === 'pressable' && ticket.contact_type === 'support' ) {
				path = '/agency/help/pressable/support';
			}

			return wpcomRequest( {
				path,
				apiNamespace: 'wpcom/v2',
				method: 'POST',
				body: ticket,
			} );
		},
	} );
}
