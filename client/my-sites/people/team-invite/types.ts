export type InviteLink = {
	key: string;
	role: string;
	link: string;
	expiry: number;
	inviteDate: string;
};

export type InviteLinks = {
	[ key: string ]: InviteLink;
};
