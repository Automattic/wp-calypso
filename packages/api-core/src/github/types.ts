export interface GitHubInstallation {
	external_id: number;
	account_name: string;
	management_url: string;
	repository_selection: 'all' | 'selected';
}

export interface GitHubRepository {
	owner: string;
	name: string;
	id: number;
	private: boolean;
	default_branch: string;
	updated_at: string;
}
