import { createGithubWorkflowMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { CodeHighlighter } from '../../components/code-highlighter';
import type { GitHubRepository } from '@automattic/api-core';

interface Workflow {
	file_name: string;
	workflow_path: string;
}

interface NewWorkflowWizardProps {
	repository: Pick< GitHubRepository, 'id' | 'owner' | 'name' >;
	repositoryBranch: string;
	workflows?: Workflow[];
	templateName: string;
	exampleTemplate: string;
	onWorkflowCreated( path: string ): void;
}

const WORKFLOWS_DIRECTORY = '.github/workflows/';
const RECOMMENDED_WORKFLOW_PATH = WORKFLOWS_DIRECTORY + 'wpcom.yml';

export const NewWorkflowWizard = ( {
	repository,
	workflows,
	repositoryBranch,
	onWorkflowCreated,
	templateName,
	exampleTemplate,
}: NewWorkflowWizardProps ) => {
	const queryClient = useQueryClient();
	const [ error, setError ] = useState< string >();

	const { mutate: createWorkflow, isPending } = useMutation( {
		...createGithubWorkflowMutation(),
		onSuccess: () => {
			// Invalidate related queries to refresh the data
			queryClient.invalidateQueries( {
				queryKey: [ 'github', 'workflows' ],
			} );
			onWorkflowCreated( RECOMMENDED_WORKFLOW_PATH );
		},
	} );

	useEffect( () => {
		const existingWorkflow = !! workflows?.find(
			( workflow ) => workflow.workflow_path === RECOMMENDED_WORKFLOW_PATH
		);

		if ( existingWorkflow ) {
			setError(
				__(
					'A workflow file with this name already exists. Installing this workflow will overwrite it.'
				)
			);
			return;
		}

		setError( undefined );
	}, [ workflows ] );

	return (
		<div className="github-deployments-new-workflow-wizard">
			<div className="github-deployments-new-workflow-wizard__workflow-file">
				<div className="github-deployments-new-workflow-wizard__workflow-file-name">
					<span>{ RECOMMENDED_WORKFLOW_PATH }</span>
				</div>

				<CodeHighlighter content={ exampleTemplate } />
			</div>

			{ error && (
				<Text variant="muted" style={ { color: 'var(--wp--preset--color--vivid-red)' } }>
					{ error }
				</Text>
			) }

			<div css={ { marginTop: '16px' } }>
				<Button
					type="button"
					variant="secondary"
					disabled={ isPending }
					isBusy={ isPending }
					onClick={ () =>
						createWorkflow( {
							repository_id: repository.id,
							repository_owner: repository.owner,
							repository_name: repository.name,
							branch_name: repositoryBranch,
							file_name: RECOMMENDED_WORKFLOW_PATH,
							workflow_template: templateName,
						} )
					}
				>
					{ __( 'Install workflow for me' ) }
				</Button>
			</div>
		</div>
	);
};
