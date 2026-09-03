import { wpcom } from '../wpcom-fetcher';
import type { AgencyTeamInviteApiResponse, AgencyTeamMemberApiResponse } from './types';

export async function fetchAgencyTeamMembers(
	agencyId: number
): Promise< AgencyTeamMemberApiResponse[] > {
	return wpcom.req.get( {
		path: `/agency/${ agencyId }/users`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchAgencyTeamInvites(
	agencyId: number
): Promise< AgencyTeamInviteApiResponse[] > {
	return wpcom.req.get( {
		path: `/agency/${ agencyId }/user-invites`,
		apiNamespace: 'wpcom/v2',
	} );
}
