import { useCallback } from 'react';
import useFetchActiveMembers from 'calypso/a8c-for-agencies/data/team/use-fetch-active-members';
import useFetchMemberInvites from 'calypso/a8c-for-agencies/data/team/use-fetch-member-invites';

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

	return {
		refetch,
		isPending: isActiveMembersPending || isMemberInvitesPending,
		activeMembers: activeMembers ?? [],
		invitedMembers:
			memberInvites?.map( ( invite ) => ( {
				id: invite.id,
				displayName: invite.displayName,
				email: invite.email,
				avatar: invite.avatar,
				status: invite.status as 'active' | 'pending' | 'expired',
			} ) ) ?? [],
		hasMembers: ( activeMembers && activeMembers.length > 1 ) || memberInvites?.length, // We exclude the owner from the count
	};
}
