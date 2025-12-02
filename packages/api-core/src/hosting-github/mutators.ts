import { wpcom } from '../wpcom-fetcher';
import { CreateWorkflowRequest, CreateWorkflowResponse } from './types';

export async function saveGithubCredentials( accessToken: string ): Promise< void > {
	return await wpcom.req.post(
		{
			path: '/hosting/github/accounts',
			apiNamespace: 'wpcom/v2',
		},
		{
			access_token: accessToken,
		}
	);
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
