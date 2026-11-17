export interface SshAccessStatus {
	setting: 'sftp' | 'ssh';
}

export interface SiteSshKey {
	sha256: string;
	user_login: string;
	name: string;
	/**
	 * Missing for keys added before labels existed, and from backends that don't return it yet.
	 */
	label?: string;
	attached_at: string;
}
