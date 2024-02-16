import { FoldableCard, FormLabel, Spinner, Card } from '@automattic/components';
import { Icon, SelectControl, Button } from '@wordpress/components';
import { check, closeSmall } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import SupportInfo from 'calypso/components/support-info';
interface DeploymentStyleProps {
	onDefineStyle?( style: string ): void;
	onValidationChange?( status: WorkFlowStates ): void;
}

type WorkFlowStates = 'loading' | 'success' | 'error';

export const DeploymentStyle = ( { onDefineStyle, onValidationChange }: DeploymentStyleProps ) => {
	const { __ } = useI18n();

	const [ deploymentStyle, setDeploymentStyle ] = useState( 'simple' );
	const [ isFetchingWorkflows, setFechingWorkflows ] = useState( true );
	const [ selectedWorkflow, setSelectedWorkflow ] = useState( 'none' );

	const [ workflowTriggeredOnPush, setWorkflowTriggeredOnPush ] =
		useState< WorkFlowStates >( 'loading' );
	const [ workflowUploadArtifact, setWorkflowUploadArtifact ] =
		useState< WorkFlowStates >( 'loading' );

	const handleDeploymentStyleChange = ( event ) => {
		const { value } = event.currentTarget;
		onDefineStyle?.( value );
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

	const RenderIcon = ( { state }: { state: WorkFlowStates } ) => {
		if ( state === 'loading' ) {
			return <Spinner className="custom-icons" />;
		}

		const icon = state === 'success' ? check : closeSmall;
		return <Icon size={ 20 } icon={ icon } className={ classNames( 'custom-icons', state ) } />;
	};

	useEffect( () => {
		onValidationChange?.( workflowUploadArtifact );
	}, [ workflowUploadArtifact ] );

	setTimeout( () => {
		setWorkflowUploadArtifact( 'error' );
	}, 2000 );

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
				<Card className="deployment-style__workflow-card">
					<RenderIcon state={ workflowTriggeredOnPush } />
					{ __( 'The workflow is triggered on push' ) }
				</Card>
				<FoldableCard
					expanded={ workflowUploadArtifact === 'error' }
					header={
						<div>
							<RenderIcon state={ workflowUploadArtifact } />
							{ __( 'The upload artifact has the required name' ) }
						</div>
					}
					screenReaderText="More"
				>
					<div>
						<p>{ __( "Ensure that your workflow generates an artifact named 'wpcom'." ) }</p>
						<p>
							- name: Upload the artifact <br></br>uses: actions/upload-artifact@v4 <br></br>with:
							name: wpcom
						</p>
					</div>
				</FoldableCard>

				<div className="deployment-style__actions">
					<Button type="button" className="button form-button">
						{ __( 'Verify workflow' ) }
					</Button>
					<Button type="button" className="button form-button">
						{ __( 'Fix workflow for me' ) }
					</Button>
				</div>
			</FormFieldset>
		</div>
	);
};
