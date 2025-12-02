import { createGithubWorkflowMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { CodeHighlighter } from '../../components/code-highlighter';
import type { GithubRepository, GithubWorkflow } from '@automattic/api-core';

interface NewWorkflowWizardProps {
	repository: GithubRepository;
	repositoryBranch: string;
	workflows?: GithubWorkflow[];
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
	const { mutate: createWorkflow, isPending } = useMutation( {
		...createGithubWorkflowMutation(),
	} );

	const existingWorkflow = workflows?.find(
		( workflow ) => workflow.workflow_path === RECOMMENDED_WORKFLOW_PATH
	);

	const errorMessage = existingWorkflow
		? __(
				'A workflow file with this name already exists. Installing this workflow will overwrite it.'
		  )
		: undefined;

	return (
		<VStack spacing={ 4 } alignment="left">
			<Text as="pre">{ RECOMMENDED_WORKFLOW_PATH }</Text>
			<CodeHighlighter content={ exampleTemplate } />

			{ errorMessage && <Text>{ errorMessage }</Text> }
			<Text variant="muted">
				{ __(
					'Proceeding will commit a new workflow configuration file to your repository‘s default branch. No other files will be affected.'
				) }
			</Text>

			<Button
				type="button"
				variant="secondary"
				disabled={ isPending }
				isBusy={ isPending }
				__next40pxDefaultSize
				onClick={ () =>
					createWorkflow(
						{
							repository_id: repository.id,
							repository_owner: repository.owner,
							repository_name: repository.name,
							branch_name: repositoryBranch,
							file_name: RECOMMENDED_WORKFLOW_PATH,
							workflow_template: templateName,
						},
						{
							onSuccess: () => {
								onWorkflowCreated( RECOMMENDED_WORKFLOW_PATH );
							},
						}
					)
				}
			>
				{ __( 'Install workflow for me' ) }
			</Button>
		</VStack>
	);
};
