import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { codePushExample, uploadArtifactExample } from './workflow-yaml-examples';

interface Validation {
	label: string;
	description: string;
	content: string;
}

interface UseWorkflowValidationsParams {
	branchName: string;
	validYamlFile: string;
}

export const useWorkflowValidations = ( {
	branchName,
	validYamlFile,
}: UseWorkflowValidationsParams ) => {
	const { __ } = useI18n();

	const validations: Record< string, Validation > = useMemo( () => {
		return {
			valid_yaml_file: {
				label: __( 'The workflow file is a valid YAML' ),
				description: __(
					'Ensure that your workflow file contains a valid YAML structure. Here’s an example:'
				),
				content: validYamlFile,
			},
			triggered_on_push: {
				label: __( 'The workflow is triggered on push' ),
				description: __( 'Ensure that your workflow triggers on code push:' ),
				content: codePushExample( branchName ),
			},
			upload_artifact_with_required_name: {
				label: __( 'The uploaded artifact has the required name' ),
				description: __( "Ensure that your workflow uploads an artifact named 'wpcom'. Example:" ),
				content: uploadArtifactExample(),
			},
		};
	}, [ __, branchName, validYamlFile ] );

	return validations;
};
