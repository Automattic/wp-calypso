import { FormLabel, Spinner } from '@automattic/components';
import { Icon, SelectControl, Button } from '@wordpress/components';
import { check, closeSmall } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import SupportInfo from 'calypso/components/support-info';
import { FormTextInputWithAffixes } from 'calypso/devdocs/design/playground-scope';
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

			<FormFieldset>
				<FormLabel>{ __( 'Workflow check' ) }</FormLabel>
				<p>
					{ translate( 'Please edit {{filename}}{{/filename}} and fix the problems we found:', {
						components: { filename: <span>deploy-live.yml</span> },
					} ) }
				</p>
				<FormTextInputWithAffixes
					noWrap
					prefix={ <Icon size={ 25 } icon={ check } className="success" /> }
					value={ __( 'The workflow is triggered on push' ) }
					id="site-redirect__input"
				/>
				<FormTextInputWithAffixes
					noWrap
					prefix={ <Icon size={ 25 } icon={ closeSmall } className="error" /> }
					value={ __( 'The upload artifact has the required name' ) }
					id="site-redirect__input"
				/>
				<div className="github-deployments-connect-repository__repository">
					<p>{ __( "Ensure that your workflow generates an artifact named 'wpcom'." ) }</p>
					<p>
						- name: Upload the artifact <br></br>uses: actions/upload-artifact@v4 <br></br>with:
						name: wpcom
					</p>
				</div>

				<Button type="submit" className="button form-button">
					{ __( 'Verify workflow' ) }
				</Button>
				<Button type="submit" className="button form-button">
					{ __( 'Fix workflow for me' ) }
				</Button>
			</FormFieldset>
		</div>
	);
};
