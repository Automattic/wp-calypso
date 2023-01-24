import type { Member } from '../types';

export type Invite = {
	key: string;
	user: Member;
	role: string;
	isPending: boolean;
	invitedBy: Member;
	inviteDate: string;
	acceptedDate?: string;
};
