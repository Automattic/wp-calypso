import { FormLabel, SelectDropdown } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import SupportInfo from 'calypso/components/support-info';
import { Workflow } from './use-deployment-workflows-query';

interface WorkflowPickerProps {
	isLoading: boolean;
	workflows?: Workflow[];
	onChange( value: string ): void;
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

	const CREATE_NEW_OPTION = useMemo( () => {
		return {
			file_name: __( 'Create new workflow' ),
			workflow_path: CREATE_WORKFLOW_OPTION,
		};
	}, [ __ ] );

	const realValue = useMemo( () => {
		return workflows?.find( ( workflow ) => workflow.workflow_path === value ) ?? CREATE_NEW_OPTION;
	}, [ workflows, value, CREATE_NEW_OPTION ] );

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
				selectedText={ realValue.file_name }
				id="workflow-dropdown"
				isLoading={ isLoading }
			>
				{ workflows?.map( ( workflow ) => (
					<SelectDropdown.Item
						key={ workflow.workflow_path }
						onClick={ () => onChange( workflow.workflow_path ) }
						selected={ realValue.workflow_path === workflow.workflow_path }
					>
						{ workflow.file_name }
					</SelectDropdown.Item>
				) ) }
				{ workflows?.length && <SelectDropdown.Separator /> }
				<SelectDropdown.Item
					onClick={ () => onChange( CREATE_NEW_OPTION.workflow_path ) }
					selected={ realValue.workflow_path === CREATE_NEW_OPTION.workflow_path }
				>
					{ CREATE_NEW_OPTION.file_name }
				</SelectDropdown.Item>
			</SelectDropdown>
		</FormFieldset>
	);
};
