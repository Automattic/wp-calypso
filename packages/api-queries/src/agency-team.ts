import {
	fetchAgencyTeamMembers,
	fetchAgencyTeamInvites,
	inviteAgencyTeamMember,
	resendAgencyTeamInvite,
	cancelAgencyTeamInvite,
	removeAgencyTeamMember,
	transferAgencyOwnership,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { AgencyTeamInviteInput, TeamMember } from '@automattic/api-core';

export const agencyTeamMembersQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'team-members' ] as const,
		queryFn: async (): Promise< TeamMember[] > => {
			const data = await fetchAgencyTeamMembers( agencyId );
			return data.map( ( member ) => ( {
				id: member.id,
				email: member.email,
				displayName: member.username,
				avatar: member.avatar_url,
				role: member.role,
				status: 'active' as const,
				dateAdded: member.joined_timestamp,
			} ) );
		},
		enabled: !! agencyId,
	} );

export const agencyTeamInvitesQuery = ( agencyId: number ) =>
	queryOptions( {
		queryKey: [ 'agency', agencyId, 'team-invites' ] as const,
		queryFn: async (): Promise< TeamMember[] > => {
			const data = await fetchAgencyTeamInvites( agencyId );
			return data.map( ( invite ) => ( {
				id: invite.id,
				email: invite.email,
				displayName: invite.username,
				avatar: invite.avatar_url,
				status: invite.status === 'expired' ? 'expired' : 'pending',
			} ) );
		},
		enabled: !! agencyId,
	} );

function invalidateAgencyTeam( agencyId: number ) {
	queryClient.invalidateQueries( { queryKey: [ 'agency', agencyId, 'team-members' ] } );
	queryClient.invalidateQueries( { queryKey: [ 'agency', agencyId, 'team-invites' ] } );
}

export const agencyTeamInviteMutation = ( agencyId: number ) =>
	mutationOptions( {
		mutationFn: ( input: AgencyTeamInviteInput ) => inviteAgencyTeamMember( agencyId, input ),
		onSuccess: () => invalidateAgencyTeam( agencyId ),
	} );

export const agencyTeamResendInviteMutation = ( agencyId: number ) =>
	mutationOptions( {
		mutationFn: ( inviteId: number ) => resendAgencyTeamInvite( agencyId, inviteId ),
	} );

export const agencyTeamCancelInviteMutation = ( agencyId: number ) =>
	mutationOptions( {
		mutationFn: ( inviteId: number ) => cancelAgencyTeamInvite( agencyId, inviteId ),
		onSuccess: () => invalidateAgencyTeam( agencyId ),
	} );

export const agencyTeamRemoveMemberMutation = ( agencyId: number ) =>
	mutationOptions( {
		mutationFn: ( userId: number ) => removeAgencyTeamMember( agencyId, userId ),
		onSuccess: () => invalidateAgencyTeam( agencyId ),
	} );

export const agencyTeamTransferOwnershipMutation = ( agencyId: number ) =>
	mutationOptions( {
		mutationFn: ( newOwnerId: number ) => transferAgencyOwnership( agencyId, newOwnerId ),
		onSuccess: () => invalidateAgencyTeam( agencyId ),
	} );
