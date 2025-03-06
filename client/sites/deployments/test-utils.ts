import { DeploymentRun } from './deployment-run-logs/use-code-deployment-run-query';
import { CodeDeploymentData } from './deployments/use-code-deployments-query';

export const createDeployment = ( args?: Partial< CodeDeploymentData > ): CodeDeploymentData => ( {
	id: 1,
	blog_id: 1,
	branch_name: 'trunk',
	created_by: {
		id: 1,
		name: 'Luis Felipe Zaguini',
	},
	created_by_user_id: 1,
	created_on: new Date().toString(),
	external_repository_id: 1,
	installation_id: 1,
	is_automated: true,
	repository_name: 'repository',
	target_dir: '/',
	updated_on: new Date().toString(),
	...args,
} );

export const createDeploymentRun = ( args?: Partial< DeploymentRun > ): DeploymentRun => ( {
	id: 1,
	status: 'success',
	started_on: new Date().toString(),
	metadata: {
		job_id: 1,
		commit_sha: '123abc45',
		commit_message: 'My message',
		author: {
			id: 1,
			name: 'Luis Felipe Zaguini',
			profile_url: 'https://github.com/user',
			avatar_url: 'https://github.com/user.jpg',
		},
	},
	triggered_by_user_id: 1,
	failure_code: null,
	code_deployment_id: 1,
	completed_on: new Date().toString(),
	created_on: new Date().toString(),
	...args,
} );
