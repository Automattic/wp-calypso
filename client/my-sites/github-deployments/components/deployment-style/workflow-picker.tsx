import { FormLabel, SelectDropdown } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SupportInfo from 'calypso/components/support-info';
import { Workflow } from './use-deployment-workflows-query';

interface WorkflowPickerProps {
	isLoading: boolean;
	workflows?: Workflow[];
	onChange( value: string, isNew: boolean ): void;
	value?: string;
}

export const CREATE_WORKFLOW_OPTION = 'CREATE_WORKFLOW_OPTION';

export const WorkflowPicker = ( {
	isLoading,
	workflows,
	onChange,
	value,
}: WorkflowPickerProps ) => {
	const { __ } = useI18n();

	const options = useMemo( () => {
		const addNewWorkflowOption = {
			value: CREATE_WORKFLOW_OPTION,
			label: __( 'Create new workflow' ),
		};

		if ( ! workflows?.length ) {
			return [ addNewWorkflowOption ];
		}

		const mappedWorkflows = workflows.map( ( workflow ) => ( {
			value: workflow.workflow_path,
			label: workflow.file_name,
		} ) );

		return [ ...mappedWorkflows, null, addNewWorkflowOption ];
	}, [ workflows, __ ] );

	return (
		<FormFieldset
			className="github-deployments-deployment-style__workflow-selection"
			style={ { marginBottom: '0px' } }
		>
			<FormLabel htmlFor="workflow-dropdown">
				{ __( 'Deployment workflow' ) }

				<SupportInfo
					text={ __(
						'A workflow is a configurable automated process that will run one or more jobs. Workflows are defined by a YAML file checked into your repository and will run when triggered by an event in your repository, or they can be triggered manually or at a defined schedule.'
					) }
					link="https://docs.github.com/en/actions/using-workflows"
					privacyLink={ false }
				/>
			</FormLabel>
			<SelectDropdown
				id="workflow-dropdown"
				options={ options }
				onSelect={ ( item: { value: string } ) => onChange( item.value, false ) }
				isLoading={ isLoading }
				selected={ value }
			/>
		</FormFieldset>
	);
};
