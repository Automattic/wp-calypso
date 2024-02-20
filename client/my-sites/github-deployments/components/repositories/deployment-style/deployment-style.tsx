import {
	Button,
	FoldableCard,
	FormInputValidation,
	FormLabel,
	Spinner,
} from '@automattic/components';
import { Icon, SelectControl } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { check, closeSmall } from '@wordpress/icons';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import SupportInfo from 'calypso/components/support-info';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { GitHubRepositoryData } from 'calypso/my-sites/github-deployments/use-github-repositories-query';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useCreateWorkflow } from './use-create-workflow';
import {
	WorkFlowStates,
	useCheckWorkflowQuery,
	useDeploymentWorkflowsQuery,
} from './use-deployment-workflows-query';

import './style.scss';

interface DeploymentStyleProps {
	installationId: number;
	repository: GitHubRepositoryData;
	branchName: string;
	onChooseWorkflow?( workflowFilename: string ): void;
	onValidationChange?( status: WorkFlowStates ): void;
}
interface WorkflowsValidationItem {
	label: string;
	key: string;
	item: JSX.Element;
	status: WorkFlowStates;
}

type DeploymentStyle = 'simple' | 'custom';

export const DeploymentStyle = ( {
	installationId,
	repository,
	branchName,
	onChooseWorkflow,
	onValidationChange,
}: DeploymentStyleProps ) => {
	const dispatch = useDispatch();
	const [ deploymentStyle, setDeploymentStyle ] = useState< DeploymentStyle >( 'simple' );
	const [ selectedWorkflow, setSelectedWorkflow ] = useState( 'none' );
	const [ isCreatingNewWorkflow, setIsCreatingNewWorkflow ] = useState( false );
	const [ validationTriggered, setValidationTriggered ] = useState( false );
	const [ errorMesseage, setErrorMesseage ] = useState( '' );

	const { data: workflows, isLoading: isFetchingWorkflows } = useDeploymentWorkflowsQuery(
		installationId,
		repository.name,
		repository.owner,
		branchName,
		deploymentStyle
	);

	const workflowsForRendering = useMemo( () => {
		const mappedValues = [ { value: 'none', label: __( 'Deployment workflows' ) } ].concat(
			workflows?.map( ( workflow ) => ( {
				value: workflow.file_name,
				label: workflow.file_name,
			} ) ) || []
		);

		return mappedValues.concat( { value: 'create-new', label: __( 'Create new workflow' ) } );
	}, [ workflows ] );

	const { isLoading: isCheckingWorkflowFile, data: workflowCheckResult } = useCheckWorkflowQuery(
		installationId,
		repository.name,
		repository.owner,
		branchName,
		selectedWorkflow
	);

	const noticeOptions = {
		duration: 3000,
	};

	const { createDeployment, isPending: isInstallingWorkflow } = useCreateWorkflow( {
		onSuccess: () => {
			dispatch( successNotice( __( 'Workflow created.' ), noticeOptions ) );
		},
		onError: ( error ) => {
			dispatch(
				errorNotice(
					// translators: "reason" is why connecting the branch failed.
					sprintf( __( 'Failed to create workflow: %(reason)s' ), { reason: error.message } ),
					{
						...noticeOptions,
					}
				)
			);
		},
		onSettled: ( _, error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_github_create_workflow_success', {
					connected: ! error,
				} )
			);
		},
	} );

	const [ workflowsValidations, setWorkflowValidations ] = useState< WorkflowsValidationItem[] >( [
		{
			label: __( 'The workflow is triggered on push' ),
			key: 'triggered_on_push',
			item: (
				<div>
					<p>{ __( "Ensure that your workflow generates an artifact named 'wpcom'." ) }</p>
					<p>
						- name: Upload the artifact <br></br>uses: actions/upload-artifact@v4 <br></br>
						with: name: wpcom
					</p>
				</div>
			),
			status: 'loading',
		},
		{
			label: __( 'The upload artifact has the required name' ),
			key: 'upload_artifact_with_required_name',
			item: (
				<div>
					<p>{ __( "Ensure that your workflow generates an artifact named 'wpcom'." ) }</p>
					<p>
						- name: Upload the artifact <br></br>uses: actions/upload-artifact@v4 <br></br>
						with: name: wpcom
					</p>
				</div>
			),
			status: 'loading',
		},
	] );

	const handleDeploymentStyleChange = ( value: DeploymentStyle ) => {
		setDeploymentStyle( value );
	};

	const handleWorkflowChange = ( workflowFilename: string ) => {
		setSelectedWorkflow( workflowFilename );
		onChooseWorkflow?.( workflowFilename );
	};

	const handleVerifyWorkflow = () => {
		alert( 'TODO: Verify workflow' );
	};

	const fixWorfklow = () => {
		alert( 'TODO: fixWorfklow' );
	};

	const installWorkflow = async () => {
		createDeployment( {
			repositoryId: repository.id,
			branchName: 'main',
			installationId,
			fileName: '.github/workflows/wpcom.yml',
		} );
	};

	const RenderIcon = ( { state }: { state: WorkFlowStates } ) => {
		if ( state === 'loading' ) {
			return <Spinner className="custom-icons" />;
		}

		const icon = state === 'success' ? check : closeSmall;
		return <Icon size={ 20 } icon={ icon } className={ classNames( 'custom-icons', state ) } />;
	};

	useEffect( () => {
		const workflowsValidationsChanged = workflowsValidations.map( ( validation ) => {
			const item = workflowCheckResult?.checked_items?.find( ( checkedItem ) => {
				return checkedItem.validation_name === validation.key;
			} );

			if ( validation.key === item?.validation_name ) {
				return {
					...validation,
					status: item.status,
				};
			}

			return validation;
		} );

		setWorkflowValidations( [ ...workflowsValidationsChanged ] );
	}, [ workflowCheckResult ] );

	useEffect( () => {
		if ( deploymentStyle === 'simple' ) {
			onValidationChange?.( 'success' );
		} else {
			onValidationChange?.( workflowCheckResult?.conclusion || 'loading' );
		}
	}, [ onValidationChange, deploymentStyle, workflowCheckResult ] );

	useEffect( () => {
		if ( deploymentStyle === 'custom' && selectedWorkflow === 'create-new' ) {
			setIsCreatingNewWorkflow( true );
		} else {
			setIsCreatingNewWorkflow( false );
		}

		if ( deploymentStyle === 'custom' ) {
			setErrorMesseage( '' );
		}
	}, [ deploymentStyle, selectedWorkflow ] );

	return (
		<div className="github-deployments-deployment-style">
			<h3 style={ { fontSize: '16px', marginBottom: '16px' } }>
				{ __( 'Pick your deployment style' ) }
			</h3>
			<FormRadiosBar
				items={ [
					{ label: __( 'Simple' ), value: 'simple' },
					{ label: __( 'Customizable' ), value: 'custom' },
				] }
				checked={ deploymentStyle }
				onChange={ ( event ) => handleDeploymentStyleChange( event.currentTarget.value ) }
				disabled={ false }
			/>

			{ deploymentStyle === 'custom' && (
				<FormFieldset>
					<FormLabel>
						{ __( 'Select deployment workflow' ) }

						<SupportInfo
							text={ __(
								'A workflow is a configurable automated process that will run one or more jobs. Workflows are defined by a YAML file checked into your repository and will run when triggered by an event in your repository, or they can be triggered manually or at a defined schedule.'
							) }
							link="https://docs.github.com/en/actions/using-workflows"
							privacyLink={ false }
						/>
					</FormLabel>
					<div className="github-deployments-connect-repository__automatic-deploys">
						<SelectControl
							value={ selectedWorkflow }
							options={ workflowsForRendering }
							onChange={ handleWorkflowChange }
						/>
						{ isFetchingWorkflows && <Spinner /> }
					</div>
				</FormFieldset>
			) }

			<FormFieldset>
				{ deploymentStyle === 'custom' &&
					selectedWorkflow !== 'none' &&
					! isCreatingNewWorkflow && (
						<>
							<FormLabel>{ __( 'Workflow check' ) }</FormLabel>
							<p>
								{ translate(
									'Please edit {{filename}}{{/filename}} and fix the problems we found:',
									{
										components: { filename: <span>deploy-live.yml</span> },
									}
								) }
							</p>

							{ workflowsValidations.map( ( validation ) => (
								<FoldableCard
									key={ validation.key }
									className={ validation.status === 'error' && validationTriggered ? 'error' : '' }
									expanded={ validation.status === 'error' }
									header={
										<>
											<RenderIcon
												state={ isCheckingWorkflowFile ? 'loading' : validation.status }
											/>
											{ validation.label }
										</>
									}
									screenReaderText="More"
								>
									{ validation.item }
								</FoldableCard>
							) ) }
						</>
					) }
				{ deploymentStyle === 'custom' && isCreatingNewWorkflow && (
					<>
						<FormLabel>{ __( 'Custom workflow' ) }</FormLabel>
						<p>
							{ __(
								'Create a new workflow file in your repository with the following content and then click ‘Verify workflow’ or let us install it for you.'
							) }
						</p>

						<FoldableCard
							className={ validationTriggered ? 'error' : '' }
							expanded={ true }
							header={ <div>.github/workflows/wpcom.yml</div> }
							screenReaderText="More"
						>
							<div>
								<p>
									- name: Upload the artifact <br></br>uses: actions/upload-artifact@v4 <br></br>
									with: name: wpcom
								</p>
							</div>
						</FoldableCard>
					</>
				) }
				{ deploymentStyle === 'custom' && errorMesseage && (
					<FormInputValidation isError={ true } text={ errorMesseage } />
				) }
				{ deploymentStyle === 'custom' && selectedWorkflow !== 'none' && (
					<div className="github-deployments-deployment-style__actions">
						<Button type="button" className="button form-button" onClick={ handleVerifyWorkflow }>
							{ __( 'Verify workflow' ) }
						</Button>
						{ workflowCheckResult?.conclusion === 'error' && (
							<Button type="button" className="button form-button" onClick={ fixWorfklow }>
								{ __( 'Fix workflow for me' ) }
							</Button>
						) }
						{ isCreatingNewWorkflow && (
							<Button
								type="button"
								busy={ isInstallingWorkflow }
								className="button form-button"
								onClick={ installWorkflow }
							>
								{ __( 'Install workflow for me' ) }
							</Button>
						) }
					</div>
				) }
			</FormFieldset>
		</div>
	);
};
