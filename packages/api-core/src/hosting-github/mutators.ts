import { wpcom } from '../wpcom-fetcher';

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

export async function createGithubWorkflow(
	request: CreateWorkflowRequest
): Promise< CreateWorkflowResponse > {
	return wpcom.req.post( {
		path: '/hosting/github/workflows',
		apiNamespace: 'wpcom/v2',
		body: request,
	} );
}
