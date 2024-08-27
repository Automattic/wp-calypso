import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { TeamMember } from 'calypso/a8c-for-agencies/sections/team/types';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

type MemberAPIResponse = {
	id: number;
	username: string;
	email: string;
	avatar_url: string;
	role: string;
};

export default function useFetchActiveMembers(): UseQueryResult< TeamMember[], unknown > {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: [ 'a4a-active-members', agencyId ],
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/users`,
			} ),
		select: ( data ) => {
			return data?.map( ( member: MemberAPIResponse ) => ( {
				id: member.id,
				displayName: member.username,
				email: member.email,
				avatar: member.avatar_url,
				role: member.role,
				status: 'active',
			} ) );
		},
		enabled: !! agencyId,
	} );
}
