import { useMutation } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

interface Invitee {
	email_or_username: string;
	role: string;
}

export function useSendInvites() {
	return useMutation( {
		mutationFn: ( invitees: Invitee[] ) => {
			return wpcomRequest( {
				path: 'invites/new',
				apiNamespace: 'wpcom/v2/',
				apiVersion: '2',
				method: 'POST',
				body: { invitees },
			} );
		},
	} );
}
