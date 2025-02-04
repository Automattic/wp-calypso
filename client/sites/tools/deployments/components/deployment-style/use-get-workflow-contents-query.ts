import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from '../../constants';

export const CODE_DEPLOYMENTS_QUERY_KEY = 'code-deployments';

type GetWorkflowContentsParams = {
	repositoryOwner: string;
	repositoryName: string;
	branchName: string;
	workflowFilename?: string;
};

export const useGetWorkflowContents = (
	{ repositoryOwner, repositoryName, branchName, workflowFilename }: GetWorkflowContentsParams,
	options?: Partial< UseQueryOptions< { content: string } > >
) => {
	return useQuery< { content: string } >( {
		queryKey: [
			GITHUB_DEPLOYMENTS_QUERY_KEY,
			CODE_DEPLOYMENTS_QUERY_KEY,
			repositoryOwner,
			repositoryName,
			branchName,
			workflowFilename,
		],
		queryFn: (): { content: string } => {
			const path = addQueryArgs( '/hosting/github/workflows/content', {
				repository_owner: repositoryOwner,
				repository_name: repositoryName,
				branch_name: branchName,
				workflow_filename: workflowFilename,
			} );

			return wp.req.get( {
				path,
				apiNamespace: 'wpcom/v2',
			} );
		},
		meta: {
			persist: false,
		},
		...options,
	} );
};
