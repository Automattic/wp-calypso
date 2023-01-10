import { UserData as User } from 'calypso/lib/user/user';

export type Invite = {
	key: string;
	user: User;
	role: string;
	isPending: boolean;
	invitedBy: User;
	inviteDate: string;
	acceptedDate?: string;
};
