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

export interface GitHubRepositoryChecks {
	inferred_type: string;
	has_composer: boolean;
	has_vendor: boolean;
	suggested_directory: string;
	protected_paths: string[];
}

export type GitHubWorkflowStatus = 'loading' | 'success' | 'error';

export interface GitHubWorkflowValidationItem {
	validation_name: string;
	status: GitHubWorkflowStatus;
}

export interface GitHubWorkflowValidation {
	conclusion: GitHubWorkflowStatus;
	file_name: string;
	workflow_path: string;
	checked_items: GitHubWorkflowValidationItem[];
}
