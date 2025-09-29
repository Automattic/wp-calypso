import { githubWorkflowChecksQuery } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { __experimentalVStack as VStack, ExternalLink, SelectControl } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useMemo, useEffect } from 'react';
import { useDeploymentWorkflowsQuery } from '../../../sites/deployments/components/deployment-style/use-deployment-workflows-query';
import { WorkflowValidationList } from './workflow-validation-list';
import {
	codePushExample,
	uploadArtifactExample,
	DEFAULT_WORKFLOW_TEMPLATE,
} from './workflow-yaml-examples';
import type { GitHubRepository } from '@automattic/api-core';

export interface WorkflowValidationDefinition {
	label: string;
	description: string;
	content: string;
}

interface AdvancedWorkflowValidationProps {
	selectedInstallationId: number;
	repository?: Pick< GitHubRepository, 'id' | 'owner' | 'name' >;
	branchName: string;
	workflowPath?: string;
	onWorkflowPathChange: ( path: string | undefined ) => void;
	disabled?: boolean;
	onWorkflowCreated?: ( path: string ) => void | Promise< void >;
	siteId: number;
}

export const AdvancedWorkflowValidation = ( {
	selectedInstallationId,
	repository,
	branchName,
	workflowPath,
	onWorkflowPathChange,
	disabled = false,
	onWorkflowCreated,
	siteId,
}: AdvancedWorkflowValidationProps ) => {
	const queryClient = useQueryClient();

	const workflowValidations = useMemo< Record< string, WorkflowValidationDefinition > >( () => {
		return {
			valid_yaml_file: {
				label: __( 'The workflow file is a valid YAML' ),
				description: __(
					"Ensure that your workflow file contains a valid YAML structure. Here's an example:"
				),
				content: DEFAULT_WORKFLOW_TEMPLATE,
			},
			triggered_on_push: {
				label: __( 'The workflow is triggered on push' ),
				description: __( 'Ensure that your workflow triggers on code push:' ),
				content: codePushExample( branchName || 'main' ),
			},
			upload_artifact_with_required_name: {
				label: __( 'The uploaded artifact has the required name' ),
				description: __( "Ensure that your workflow uploads an artifact named 'wpcom'. Example:" ),
				content: uploadArtifactExample(),
			},
		};
	}, [ branchName ] );

	const {
		data: workflowChecks,
		isFetching: isFetchingWorkflowChecks,
		refetch: refetchWorkflowChecks,
	} = useQuery(
		githubWorkflowChecksQuery(
			repository?.owner ?? '',
			repository?.name ?? '',
			branchName,
			workflowPath ?? ''
		)
	);

	const { data: workflows = [], isLoading: isLoadingWorkflows } = useDeploymentWorkflowsQuery(
		repository ? { owner: repository.owner, name: repository.name } : undefined,
		branchName,
		{
			enabled: !! repository && !! branchName,
		}
	);

	const canVerifyWorkflow = Boolean(
		workflowPath && selectedInstallationId && repository && branchName
	);

	const CREATE_WORKFLOW_OPTION = 'CREATE_WORKFLOW_OPTION';

	const workflowOptions = useMemo( () => {
		const options = workflows.map( ( workflow ) => ( {
			label: workflow.file_name,
			value: workflow.workflow_path,
		} ) );

		// Add "Create new workflow" option
		options.push( {
			label: __( 'Create new workflow' ),
			value: CREATE_WORKFLOW_OPTION,
		} );

		return options;
	}, [ workflows ] );

	const isCreatingNewWorkflow = workflowPath === CREATE_WORKFLOW_OPTION;

	// Auto-select the first workflow if none is selected and workflows are available
	useEffect( () => {
		if ( workflows.length > 0 && ! workflowPath ) {
			onWorkflowPathChange( workflows[ 0 ].workflow_path );
		}
	}, [ workflows, workflowPath, onWorkflowPathChange ] );

	const handleVerifyWorkflow = () => {
		if ( ! canVerifyWorkflow ) {
			return;
		}

		void refetchWorkflowChecks();
	};

	const handleWorkflowPathChange = ( value: string ) => {
		const trimmedValue = value.trim();
		onWorkflowPathChange( trimmedValue ? trimmedValue : undefined );
	};

	const handleWorkflowCreated = async ( workflowPath: string ) => {
		// Invalidate workflows query to refresh the list
		await queryClient.invalidateQueries( {
			queryKey: [ 'deployment-workflows', repository?.owner, repository?.name, branchName ],
		} );

		// When a workflow is created, select it in the dropdown
		onWorkflowPathChange( workflowPath );
		onWorkflowCreated?.( workflowPath );
	};

	return (
		<VStack spacing={ 3 }>
			<SelectControl
				label={ __( 'Deployment workflow' ) }
				value={ workflowPath ?? '' }
				onChange={ handleWorkflowPathChange }
				disabled={ disabled || isLoadingWorkflows }
				options={ workflowOptions }
				help={ createInterpolateElement(
					__(
						'You can start with our basic workflow file and extend it. Looking for inspiration? Check out our <a>workflow recipes</a>.'
					),
					{
						a: (
							<ExternalLink href="https://developer.wordpress.com/docs/developer-tools/github-deployments/github-deployments-workflow-recipes/">
								{ __( 'workflow recipes' ) }
							</ExternalLink>
						),
					}
				) }
				__next40pxDefaultSize
			/>

			<WorkflowValidationList
				validations={ workflowValidations }
				result={ workflowChecks }
				isLoading={ isFetchingWorkflowChecks }
				onVerify={ handleVerifyWorkflow }
				canVerify={ canVerifyWorkflow }
				repository={ repository }
				branchName={ branchName }
				workflowPath={ workflowPath }
				onWorkflowCreated={ handleWorkflowCreated }
				disabled={ disabled }
				siteId={ siteId }
				installationId={ selectedInstallationId }
				workflows={ workflows }
				isCreatingNewWorkflow={ isCreatingNewWorkflow }
			/>
		</VStack>
	);
};
