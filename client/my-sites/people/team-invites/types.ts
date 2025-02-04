import type { Member } from '@automattic/data-stores';

export type Invite = {
	key: string;
	user: Member;
	role: string;
	isPending: boolean;
	invitedBy: Member;
	inviteDate: string;
	acceptedDate?: string;
};
