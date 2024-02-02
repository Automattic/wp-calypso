export interface GitHubConnection {
	ID: number;
	connected: boolean;
	installation: Installation;
	repo: string;
	branch: string;
	base_path: string;
	label: string;
	external_name: string;
}

export interface Installation {
	id: number;
	target_id: number;
	target_type: string;
	selection: string;
	login: string;
	avatar_url: string;
	type: string;
	repositories: [ key: string ];
}

export interface Repositories {
	[ key: string ]: string;
}
