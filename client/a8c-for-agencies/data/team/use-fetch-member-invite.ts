import { UseQueryResult, useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

type MemberInvite = {
	id: number;
	email: string;
	status: string;
	expires_at: number;
};

export default function useFetchMemberInvites(): UseQueryResult< MemberInvite[], unknown > {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: [ 'a4a-member-invites', agencyId ],
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/user-invites`,
			} ),
		select: ( data ) => {
			return data?.map( ( invite: MemberInvite ) => ( {
				id: invite.id,
				email: invite.email,
				status: invite.status,
				expires_at: new Date( invite.expires_at ),
			} ) );
		},
		enabled: !! agencyId,
	} );
}
