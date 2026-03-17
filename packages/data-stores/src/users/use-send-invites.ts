import { useMutation } from '@tanstack/react-query';
import { wpcom } from '../wpcom-request';

interface Invitee {
	email_or_username: string;
	role: string;
}

export function useSendInvites( siteId: number ) {
	return useMutation( {
		mutationFn: ( invitees: Invitee[] ) => {
			return wpcom.req.post( {
				path: `/sites/${ encodeURIComponent( siteId ) }/invites/new`,
				apiNamespace: 'wpcom/v2',
				body: { invitees },
			} );
		},
	} );
}
