import { githubWorkflowChecksQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { TextControl, __experimentalVStack as VStack, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
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
}

export const AdvancedWorkflowValidation = ( {
	selectedInstallationId,
	repository,
	branchName,
	workflowPath,
	onWorkflowPathChange,
	disabled = false,
}: AdvancedWorkflowValidationProps ) => {
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
				description: __( 'Ensure that your workflow uploads an artifact named ‘wpcom’. Example:' ),
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

	const canVerifyWorkflow = Boolean(
		workflowPath && selectedInstallationId && repository && branchName
	);

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

	return (
		<VStack spacing={ 3 }>
			<TextControl
				label={ __( 'Deployment workflow' ) }
				value={ workflowPath ?? '' }
				onChange={ handleWorkflowPathChange }
				disabled={ disabled }
				placeholder="wpcom.yml"
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
			/>
		</VStack>
	);
};
