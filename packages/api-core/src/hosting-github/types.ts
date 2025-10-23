export interface GithubInstallation {
	external_id: number;
	account_name: string;
	management_url: string;
	repository_selection: 'all' | 'selected';
}

export interface GithubRepository {
	owner: string;
	name: string;
	id: number;
	private: boolean;
	default_branch: string;
	updated_at: string;
}

export interface GithubRepositoryChecks {
	inferred_type: string;
	has_composer: boolean;
	has_vendor: boolean;
	suggested_directory: string;
	protected_paths: string[];
}

export type GithubWorkflowStatus = 'loading' | 'success' | 'error';

export interface GithubWorkflowValidationItem {
	validation_name: string;
	status: GithubWorkflowStatus;
}

export interface GithubWorkflowValidation {
	conclusion: GithubWorkflowStatus;
	file_name: string;
	workflow_path: string;
	checked_items: GithubWorkflowValidationItem[];
}

export interface GithubWorkflowTemplate {
	template: string;
}

export interface GithubWorkflow {
	file_name: string;
	workflow_path: string;
}

export interface CreateWorkflowRequest {
	repository_id: number;
	repository_owner: string;
	repository_name: string;
	branch_name: string;
	file_name: string;
	workflow_template: string;
}

export interface CreateWorkflowResponse {
	message: string;
}
