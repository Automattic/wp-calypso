import { createGithubWorkflowMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { CodeHighlighter } from '../../components/code-highlighter';
import type { GitHubRepository, GitHubWorkflow } from '@automattic/api-core';

interface NewWorkflowWizardProps {
	repository: GitHubRepository;
	repositoryBranch: string;
	workflows?: GitHubWorkflow[];
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
		<VStack spacing={ 4 }>
			<Text as="pre">{ RECOMMENDED_WORKFLOW_PATH }</Text>
			<CodeHighlighter content={ exampleTemplate } />

			{ error && <Text>{ error }</Text> }

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
		</VStack>
	);
};
