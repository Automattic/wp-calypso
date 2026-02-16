export interface InviteGarden {
	name: string;
	partner: string;
}

export interface InviteBlogDetails {
	domain: string;
	title: string;
	URL: string;
	is_vip?: boolean;
	admin_url?: string;
	is_garden_site?: boolean;
	garden?: InviteGarden;
}

export interface InviteSite {
	ID: number;
	URL: string;
	title: string;
	domain: string;
	is_wpforteams_site?: boolean;
	is_vip?: boolean;
	admin_url?: string;
	is_garden?: boolean;
	garden_name?: string;
	garden_partner?: string;
}

export interface InviteMeta {
	role: string;
	sent_to: string;
	blog_id: number;
	is_external?: boolean;
	force_matching_email?: boolean;
	known?: boolean;
}

export interface InviteDetails {
	invite_slug: string;
	blog_id: string;
	meta: InviteMeta;
}

export interface Inviter {
	ID: number;
	name: string;
	avatar_URL?: string;
}

export interface Invite {
	inviteKey: string;
	activationKey?: string;
	invite: InviteDetails;
	inviter?: Inviter;
	blog_details?: InviteBlogDetails;
	// Legacy fields for compatibility
	site?: InviteSite;
	role?: string;
	sentTo?: string;
}
