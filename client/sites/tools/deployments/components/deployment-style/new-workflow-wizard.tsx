import { FormInputValidation } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
import { CodeHighlighter } from '../code-highlighter';
import { useCreateWorkflow } from './use-create-workflow';
import { Workflow } from './use-deployment-workflows-query';

import './style.scss';

interface NewWorkflowWizardProps {
	repository: Pick< GitHubRepositoryData, 'id' | 'owner' | 'name' >;
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
	const { __ } = useI18n();

	const { createWorkflow, isPending } = useCreateWorkflow( {
		onSuccess: () => {
			onWorkflowCreated( RECOMMENDED_WORKFLOW_PATH );
		},
	} );

	const [ error, setError ] = useState< string >();

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
	}, [ workflows, __ ] );

	return (
		<div className="github-deployments-new-workflow-wizard">
			<div className="github-deployments-new-workflow-wizard__workflow-file">
				<div className="github-deployments-new-workflow-wizard__workflow-file-name">
					<span>{ RECOMMENDED_WORKFLOW_PATH }</span>
				</div>

				<CodeHighlighter content={ exampleTemplate } />
			</div>

			{ error && (
				<FormInputValidation css={ { paddingBottom: '0 !important' } } isError text={ error } />
			) }

			<div css={ { marginTop: '16px' } }>
				<Button
					type="button"
					variant="secondary"
					disabled={ isPending }
					isBusy={ isPending }
					onClick={ () =>
						createWorkflow( {
							repositoryId: repository.id,
							repositoryOwner: repository.owner,
							repositoryName: repository.name,
							branchName: repositoryBranch,
							fileName: RECOMMENDED_WORKFLOW_PATH,
							workflowTemplate: templateName,
						} )
					}
				>
					{ __( 'Install workflow for me' ) }
				</Button>
			</div>
		</div>
	);
};
