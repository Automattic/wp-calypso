/**
 * A team member's status within an agency. `active` members have accepted;
 * `pending` and `expired` are outstanding invitations.
 */
export type TeamMemberStatus = 'active' | 'pending' | 'expired';

/**
 * Normalized team member, shared by the active-members and invited-members
 * lists so both can render in a single combined list.
 */
export interface TeamMember {
	id: number;
	email: string;
	displayName?: string;
	role?: string;
	avatar?: string;
	dateAdded?: string;
	status: TeamMemberStatus;
}

/**
 * Raw active member, as returned by GET /wpcom/v2/agency/{agencyId}/users.
 */
export interface AgencyTeamMemberApiResponse {
	id: number;
	username: string;
	email: string;
	avatar_url: string;
	role: string;
	joined_timestamp: string;
}

/**
 * Raw invitation, as returned by GET /wpcom/v2/agency/{agencyId}/user-invites.
 */
export interface AgencyTeamInviteApiResponse {
	id: number;
	email: string;
	status: string;
	expires_at: string;
	created_at: string;
	avatar_url?: string;
	username?: string;
}

export interface AgencyTeamInviteInput {
	login: string;
	message?: string;
}

export interface AgencyTeamInviteActivationInput {
	agencyId: number;
	inviteId: number;
	secret: string;
}

/**
 * The agencies named by the `a4a_user_invite_already_member_of_agency` error:
 * the ones the user already belongs to, and the one the invite is for.
 */
export interface AgencyTeamInviteAgency {
	id: number;
	name: string;
}

export interface AgencyTeamInviteActivationError extends Error {
	code?: string;
	data?: {
		user_agencies?: AgencyTeamInviteAgency[];
		target_agency?: AgencyTeamInviteAgency;
	};
}
