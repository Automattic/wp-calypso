import { useCallback, useMemo } from 'react';
import useFetchActiveMembers from 'calypso/a8c-for-agencies/data/team/use-fetch-active-members';
import useFetchMemberInvites from 'calypso/a8c-for-agencies/data/team/use-fetch-member-invite';
import { OWNER_ROLE } from '../constants';

export function useMemberList() {
	const {
		data: activeMembers,
		isPending: isActiveMembersPending,
		refetch: refetchActiveMembers,
	} = useFetchActiveMembers();

	const {
		data: memberInvites,
		isPending: isMemberInvitesPending,
		refetch: refetchMemberInvites,
	} = useFetchMemberInvites();

	const refetch = useCallback( () => {
		refetchActiveMembers();
		refetchMemberInvites();
	}, [ refetchActiveMembers, refetchMemberInvites ] );

	const members = useMemo( () => {
		const data = [
			...( activeMembers?.filter( ( member ) => member.role !== OWNER_ROLE ) ?? [] ),
			...( memberInvites?.map( ( invite ) => ( {
				id: invite.id,
				email: invite.email,
				avatar: invite.avatar,
				status: 'pending',
			} ) ) ?? [] ),
		];

		const owner = activeMembers?.find( ( member ) => member.role === OWNER_ROLE );

		if ( owner ) {
			// We need to make sure the owner is always at the first position
			data.unshift( owner );
		}

		return data;
	}, [ activeMembers, memberInvites ] );

	return {
		refetch,
		isPending: isActiveMembersPending || isMemberInvitesPending,
		members,
		hasMembers: members.length > 1, // We exclude the owner from the count
	};
}
