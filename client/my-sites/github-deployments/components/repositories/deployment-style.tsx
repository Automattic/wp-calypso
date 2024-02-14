import { FormLabel, Spinner } from '@automattic/components';
import { Popover, SelectControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import InlineSupportLink from 'calypso/components/inline-support-link';
import SupportInfo from 'calypso/components/support-info';
interface DeploymentStyleProps {
	onChange?( query: string ): void;
}

export const DeploymentStyle = ( { onChange }: DeploymentStyleProps ) => {
	const { __ } = useI18n();

	const [ deploymentStyle, setDeploymentStyle ] = useState( 'simple' );
	const [ isFetchingWorkflows, setFechingWorkflows ] = useState( true );
	const [ selectedWorkflow, setSelectedWorkflow ] = useState( 'none' );

	const handleDeploymentStyleChange = ( event ) => {
		const { value } = event.currentTarget;

		setDeploymentStyle( value );
	};

	const handleWorkflowChange = ( value: string ) => {
		setSelectedWorkflow( value );
	};

	const workflows = [
		{ value: 'none', label: __( 'Deployment workflows' ) },
		{ value: 'deploy-live', label: 'deploy-live.yml' },
		{ value: 'test', label: 'test.yml' },
	];

	return (
		<div className="deployment-style">
			<h3 style={ { fontSize: '16px', marginBottom: '16px' } }>
				{ __( 'Pick your deployment style' ) }
			</h3>
			<FormRadiosBar
				items={ [
					{ label: __( 'Simple' ), value: 'simple' },
					{ label: __( 'Customizable' ), value: 'custom' },
				] }
				checked={ deploymentStyle }
				onChange={ handleDeploymentStyleChange }
				disabled={ false }
			/>

			{ deploymentStyle === 'custom' && (
				<FormFieldset>
					<FormLabel>
						{ __( 'Select deployment workflow' ) }

						<SupportInfo
							text={ __(
								'A workflow is a configurable automated process that will run one or more jobs. Workflows are defined by a YAML file checked in to your repository and will run when triggered by an event in your repository, or they can be triggered manually, or at a defined schedule.'
							) }
							link="https://docs.github.com/en/actions/using-workflows"
							privacyLink={ false }
						/>
					</FormLabel>
					<div className="github-deployments-connect-repository__automatic-deploys">
						<SelectControl
							value={ selectedWorkflow }
							options={ workflows }
							onChange={ handleWorkflowChange }
						/>
						{ isFetchingWorkflows && <Spinner /> }
					</div>
				</FormFieldset>
			) }
		</div>
	);
};
