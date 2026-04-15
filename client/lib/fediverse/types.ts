export interface FediAccount {
	username: string;
	instance: string;
	displayName: string;
	bio: string;
	avatarUrl: string;
	feedUrl?: string;
}
