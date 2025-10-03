export interface SshAccessStatus {
	setting: 'sftp' | 'ssh';
}

export interface SiteSshKey {
	sha256: string;
	user_login: string;
	name: string;
	attached_at: string;
}
