import { useCallback, useMemo } from 'react';
import useFetchActiveMembers from 'calypso/a8c-for-agencies/data/team/use-fetch-active-members';
import useFetchMemberInvites from 'calypso/a8c-for-agencies/data/team/use-fetch-member-invites';
import { TeamMember } from '../types';

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

	const members: TeamMember[] = useMemo( () => {
		const data = [
			...( activeMembers ?? [] ),
			...( memberInvites?.map( ( invite ) => ( {
				id: invite.id,
				displayName: invite.displayName,
				email: invite.email,
				avatar: invite.avatar,
				status: 'pending' as const,
			} ) ) ?? [] ),
		];

		return data;
	}, [ activeMembers, memberInvites ] );

	return {
		refetch,
		isPending: isActiveMembersPending || isMemberInvitesPending,
		members,
		hasMembers: members.length > 1, // We exclude the owner from the count
	};
}
