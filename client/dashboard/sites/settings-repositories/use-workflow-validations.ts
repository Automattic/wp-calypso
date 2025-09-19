import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import {
	codePushExample,
	uploadArtifactExample,
	DEFAULT_WORKFLOW_TEMPLATE,
} from './workflow-yaml-examples';

export interface WorkflowValidationDefinition {
	label: string;
	description: string;
	content: string;
}

export const useWorkflowValidations = ( branchName: string ) => {
	return useMemo< Record< string, WorkflowValidationDefinition > >( () => {
		return {
			valid_yaml_file: {
				label: __( 'The workflow file is a valid YAML' ),
				description: __(
					'Ensure that your workflow file contains a valid YAML structure. Here’s an example:'
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
};
