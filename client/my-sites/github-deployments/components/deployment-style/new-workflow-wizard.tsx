import { Button, FormInputValidation, FormLabel } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { ChangeEvent, useEffect, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormTextInput from '../../../../components/forms/form-text-input';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
import { CodeHighlighter } from '../code-highlighter';
import { useDeploymentStyleContext } from './context';
import { useCreateWorkflow } from './use-create-workflow';
import { Workflow } from './use-deployment-workflows-query';
import { newComposerWorkflowExample, newWorkflowExample } from './workflow-yaml-examples';

import './style.scss';

interface NewWorkflowWizardProps {
	repository: Pick< GitHubRepositoryData, 'id' | 'owner' | 'name' >;
	repositoryBranch: string;
	isLoadingWorkflows: boolean;
	workflows?: Workflow[];
	useComposerWorkflow: boolean;
	onWorkflowVerification( path: string ): void;
	onWorkflowCreated( path: string ): void;
}

const WORKFLOWS_DIRECTORY = '.github/workflows/';
const RECOMMENDED_WORKFLOW_PATH = WORKFLOWS_DIRECTORY + 'wpcom.yml';

export const NewWorkflowWizard = ( {
	repository,
	workflows,
	isLoadingWorkflows,
	repositoryBranch,
	onWorkflowVerification,
	onWorkflowCreated,
	useComposerWorkflow,
}: NewWorkflowWizardProps ) => {
	const { __ } = useI18n();

	const { isCheckingWorkflow } = useDeploymentStyleContext();
	const [ workflowPath, setWorkflowPath ] = useState( () => {
		const existingWorkflow = workflows?.find(
			( workflow ) => workflow.workflow_path === RECOMMENDED_WORKFLOW_PATH
		);

		if ( ! existingWorkflow ) {
			return RECOMMENDED_WORKFLOW_PATH;
		}

		return existingWorkflow.workflow_path;
	} );

	const { createWorkflow, isPending } = useCreateWorkflow( {
		onSuccess: () => {
			onWorkflowCreated( workflowPath );
		},
	} );

	const [ error, setError ] = useState< string >();

	useEffect( () => {
		const existingWorkflow = !! workflows?.find(
			( workflow ) => workflow.workflow_path === workflowPath
		);

		if ( existingWorkflow ) {
			setError( __( 'A workflow file with this name already exist' ) );
			return;
		}

		const notEndingInYml = ! /\.ya?ml$/.test( workflowPath );

		if ( notEndingInYml ) {
			setError( __( 'The workflow file path must end with .yml' ) );
			return;
		}

		const notStartingWithWorkflowDir = ! workflowPath.startsWith( WORKFLOWS_DIRECTORY );

		if ( notStartingWithWorkflowDir ) {
			setError( __( 'The workflow file must live under the .github/workflows directory' ) );
			return;
		}

		setError( undefined );
	}, [ workflows, workflowPath, __ ] );

	const workflowContent = useComposerWorkflow
		? newComposerWorkflowExample( repositoryBranch )
		: newWorkflowExample( repositoryBranch );

	return (
		<div className="github-deployments-new-workflow-wizard">
			<p css={ { marginBottom: 0 } }>
				{ __(
					'Create a new workflow file in your repository with the following content and then click ‘Verify workflow’ or let us install it for you.'
				) }
			</p>

			<FormFieldset>
				<FormLabel htmlFor="workflow-file-name">{ __( 'Workflow file name' ) }</FormLabel>
				<FormTextInput
					id="workflow-file-name"
					placeholder={ __( 'Enter the workflow file name' ) }
					onChange={ ( e: ChangeEvent< HTMLInputElement > ) => {
						setWorkflowPath( e.target.value );
					} }
					value={ workflowPath }
				/>
				{ error && (
					<FormInputValidation css={ { paddingBottom: '0 !important' } } isError text={ error } />
				) }
			</FormFieldset>

			<CodeHighlighter content={ workflowContent } />

			<div css={ { marginTop: '16px' } }>
				<Button
					type="button"
					className="button form-button"
					onClick={ () => onWorkflowVerification( workflowPath ) }
					disabled={ isCheckingWorkflow || isLoadingWorkflows || !! error }
					busy={ isCheckingWorkflow || isLoadingWorkflows }
				>
					{ __( 'Verify workflow' ) }
				</Button>
				<Button
					type="button"
					className="button form-button"
					disabled={ !! error || isPending }
					busy={ isPending }
					onClick={ () =>
						createWorkflow( {
							repositoryId: repository.id,
							repositoryOwner: repository.owner,
							repositoryName: repository.name,
							branchName: repositoryBranch,
							fileName: workflowPath,
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
