export interface SftpUser {
	username: string;
	password: string;
}

export interface SftpUsersDeleteResult {
	removed_users: string[];
	detached_keys: string[];
}
