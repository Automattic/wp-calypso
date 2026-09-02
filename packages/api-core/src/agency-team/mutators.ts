import { wpcom } from '../wpcom-fetcher';
import type { AgencyTeamInviteInput } from './types';

export async function inviteAgencyTeamMember(
	agencyId: number,
	input: AgencyTeamInviteInput
): Promise< { success: boolean } > {
	return wpcom.req.post(
		{
			path: `/agency/${ agencyId }/user-invites`,
			apiNamespace: 'wpcom/v2',
		},
		input
	);
}

export async function resendAgencyTeamInvite(
	agencyId: number,
	inviteId: number
): Promise< { success: boolean } > {
	return wpcom.req.post( {
		path: `/agency/${ agencyId }/user-invites/${ inviteId }/resend`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function cancelAgencyTeamInvite(
	agencyId: number,
	inviteId: number
): Promise< { success: boolean } > {
	return wpcom.req.post( {
		path: `/agency/${ agencyId }/user-invites/${ inviteId }`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );
}

export async function removeAgencyTeamMember(
	agencyId: number,
	userId: number
): Promise< { success: boolean } > {
	return wpcom.req.post( {
		path: `/agency/${ agencyId }/users/${ userId }`,
		apiNamespace: 'wpcom/v2',
		method: 'DELETE',
	} );
}

export async function transferAgencyOwnership(
	agencyId: number,
	newOwnerId: number
): Promise< { success: boolean } > {
	return wpcom.req.post( {
		path: `/agency/${ agencyId }/transfer-ownership`,
		apiNamespace: 'wpcom/v2',
		method: 'PUT',
		body: {
			new_owner_id: newOwnerId,
		},
	} );
}
