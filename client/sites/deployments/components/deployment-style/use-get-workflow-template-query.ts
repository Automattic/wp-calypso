import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from '../../constants';

export const WORKFLOW_TEMPLATES = 'workflow-templates';

type GetWorkflowContentsParams = {
	template: 'simple' | 'with_composer';
	branchName: string;
};

export const useWorkflowTemplate = (
	{ template, branchName }: GetWorkflowContentsParams,
	options?: Partial< UseQueryOptions< { template: string } > >
) => {
	return useQuery< { template: string } >( {
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, WORKFLOW_TEMPLATES, branchName, template ],
		queryFn: (): { template: string } => {
			const path = addQueryArgs( '/hosting/github/workflow-templates', {
				template,
				branch_name: branchName,
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
