export type DeploymentRunStatus =
	| 'pending'
	| 'queued'
	| 'running'
	| 'success'
	| 'failed'
	| 'warnings'
	| 'building'
	| 'dispatched'
	| 'unknown';

interface DeploymentRunMetadata {
	commit_message: string;
	commit_sha: string;
	job_id: number;
	author: {
		avatar_url: string;
		id: number;
		name: string;
		profile_url: string;
	};
}

export interface DeploymentRun {
	id: number;
	code_deployment_id: number;
	created_on: string;
	started_on: string;
	completed_on: string | null;
	status: DeploymentRunStatus;
	failure_code: string | null;
	triggered_by_user_id: number;
	metadata: DeploymentRunMetadata;
}

export interface CodeDeploymentData {
	id: number;
	blog_id: number;
	created_by_user_id: number;
	created_on: string;
	updated_on: string;
	external_repository_id: number;
	repository_name: string;
	branch_name: string;
	target_dir: string;
	is_automated: boolean;
	installation_id: number;
	created_by: {
		id: number;
		name: string;
	};
	current_deployed_run?: DeploymentRun;
	current_deployment_run?: DeploymentRun;
	workflow_path?: string;
}

export interface DeploymentRunWithDeploymentInfo extends DeploymentRun {
	repository_name: string;
	branch_name: string;
	is_automated: boolean;
	is_active_deployment: boolean;
}

export interface CodeDeploymentDeleteResponse {
	message: string;
}

export interface LogEntry {
	message: string;
	level: string;
	timestamp: string;
	context?: {
		command: {
			command_identifier: string;
			exit_code: number;
		};
	};
}

export interface LogEntryDetail {
	exit_code: number;
	stdout: Array< string >;
	stderr: Array< string >;
}

export interface CreateCodeDeploymentVariables {
	external_repository_id: number;
	branch_name: string;
	target_dir: string;
	installation_id: number;
	is_automated: boolean;
	workflow_path?: string;
}

export interface CreateCodeDeploymentResponse {
	message: string;
	target_dir: string;
	workflow_path?: string;
	is_automated: boolean;
}

export interface CreateCodeDeploymentError {
	code: string;
	message: string;
}
