import { Button, FormInputValidation } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
import { CodeHighlighter } from '../code-highlighter';
import { useCreateWorkflow } from './use-create-workflow';
import { Workflow } from './use-deployment-workflows-query';
import { newComposerWorkflowExample, newWorkflowExample } from './workflow-yaml-examples';

import './style.scss';

interface NewWorkflowWizardProps {
	repository: Pick< GitHubRepositoryData, 'id' | 'owner' | 'name' >;
	repositoryBranch: string;
	workflows?: Workflow[];
	useComposerWorkflow: boolean;
	onWorkflowCreated( path: string ): void;
}

const WORKFLOWS_DIRECTORY = '.github/workflows/';
const RECOMMENDED_WORKFLOW_PATH = WORKFLOWS_DIRECTORY + 'wpcom.yml';

export const NewWorkflowWizard = ( {
	repository,
	workflows,
	repositoryBranch,
	onWorkflowCreated,
	useComposerWorkflow,
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

	const workflowContent = useComposerWorkflow
		? newComposerWorkflowExample( repositoryBranch )
		: newWorkflowExample( repositoryBranch );

	return (
		<div className="github-deployments-new-workflow-wizard">
			<p css={ { marginBottom: 0 } }>
				{ __( 'Use our suggested workflow which you can install and then extend at GitHub.' ) }
			</p>

			<div className="github-deployments-new-workflow-wizard__workflow-file">
				<div className="github-deployments-new-workflow-wizard__workflow-file-name">
					<span>{ RECOMMENDED_WORKFLOW_PATH }</span>
				</div>

				<CodeHighlighter content={ workflowContent } />
			</div>

			{ error && (
				<FormInputValidation css={ { paddingBottom: '0 !important' } } isError text={ error } />
			) }

			<div css={ { marginTop: '16px' } }>
				<Button
					type="button"
					className="button form-button"
					disabled={ isPending }
					busy={ isPending }
					onClick={ () =>
						createWorkflow( {
							repositoryId: repository.id,
							repositoryOwner: repository.owner,
							repositoryName: repository.name,
							branchName: repositoryBranch,
							fileName: RECOMMENDED_WORKFLOW_PATH,
							fileContent: workflowContent,
						} )
					}
				>
					{ __( 'Install workflow for me' ) }
				</Button>
			</div>
		</div>
	);
};
