import {
	Button,
	FoldableCard,
	FormInputValidation,
	FormLabel,
	SelectDropdown,
	Spinner,
} from '@automattic/components';
import { ExternalLink, Icon } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { check, closeSmall } from '@wordpress/icons';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-yaml';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import SupportInfo from 'calypso/components/support-info';
import { GitHubRepositoryData } from 'calypso/my-sites/github-deployments/use-github-repositories-query';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useCreateWorkflow } from './use-create-workflow';
import {
	WorkFlowStates,
	Workflows,
	useCheckWorkflowQuery,
	useDeploymentWorkflowsQuery,
} from './use-deployment-workflows-query';
import {
	CodePushExample,
	NewWorkflowExample,
	UploadArtifactExample,
} from './workflow-yaml-examples';
import './style.scss';

interface DeploymentStyleProps {
	installationId: number;
	repository: GitHubRepositoryData;
	branchName: string;
	workflowPath?: string;
	onChooseWorkflow?( workflowFilename: string | undefined ): void;
	onValidationChange?( status: WorkFlowStates ): void;
}
interface WorkflowsValidationItem {
	label: string;
	key: string;
	item: JSX.Element;
	status: WorkFlowStates;
}

type DeploymentStyle = 'simple' | 'custom';

const noticeOptions = {
	duration: 3000,
};

export const DeploymentStyle = ( {
	installationId,
	repository,
	branchName,
	workflowPath,
	onChooseWorkflow,
	onValidationChange,
}: DeploymentStyleProps ) => {
	const defaultWorkflowFilepath = '.github/workflows/wpcom.yml';
	const getWorkflowNameFromFilepath = ( filepath: string ) => {
		return filepath.split( '/' ).pop() || filepath;
	};

	const dispatch = useDispatch();
	const [ deploymentStyle, setDeploymentStyle ] = useState< DeploymentStyle >(
		workflowPath ? 'custom' : 'simple'
	);

	const [ selectedWorkflow, setSelectedWorkflow ] = useState< Workflows >( {
		file_name: workflowPath ? getWorkflowNameFromFilepath( workflowPath ) : 'none',
		workflow_path: workflowPath || 'none',
	} );
	const [ isCreatingNewWorkflow, setIsCreatingNewWorkflow ] = useState( false );
	const [ isYamlValid, setIsYamlValid ] = useState( true );
	const validationTriggered = false;
	const isTemplateRepository = repository.owner === 'Automattic';
	const yamlCodeRef = useRef( null );
	const {
		data: workflows,
		isLoading: isFetchingWorkflows,
		isRefetching: isRefreshingWorkflows,
		refetch: refetchWorkflows,
	} = useDeploymentWorkflowsQuery( installationId, repository, branchName, deploymentStyle );

	const workflowsForRendering = useMemo( () => {
		const mappedValues = [
			{ workflow_path: 'none', file_name: __( 'Deployment workflows' ) },
		].concat(
			workflows?.map( ( workflow ) => ( {
				workflow_path: workflow.workflow_path,
				file_name: workflow.file_name,
			} ) ) || []
		);

		return mappedValues.concat( {
			workflow_path: 'create-new',
			file_name: __( 'Create new workflow' ),
		} );
	}, [ workflows ] );

	const {
		isLoading: isCheckingWorkflowFile,
		data: workflowCheckResult,
		refetch: refetchWorkflowValidation,
		isRefetching: isRefetchingWorkflowValidation,
	} = useCheckWorkflowQuery(
		installationId,
		repository,
		branchName,
		selectedWorkflow.workflow_path || '',
		isTemplateRepository
	);

	const isWorkflowInvalid =
		! ( isFetchingWorkflows || isRefreshingWorkflows ) && selectedWorkflow.file_name === 'none';
	const workflowFileName = workflowPath
		? workflowPath.substring( workflowPath.lastIndexOf( '/' ) + 1 )
		: '';
	const workflowFileUrl = `https://www.github.com/${ repository.owner }/${ repository.name }/blob/${ branchName }/${ workflowPath }`;

	const { createDeployment, isPending: isInstallingWorkflow } = useCreateWorkflow( {
		onSuccess: () => {
			refetchWorkflows();
			setSelectedWorkflow( {
				file_name: getWorkflowNameFromFilepath( defaultWorkflowFilepath ),
				workflow_path: defaultWorkflowFilepath,
			} );
			dispatch( successNotice( __( 'Workflow created' ), noticeOptions ) );
		},
		onError: ( error ) => {
			dispatch(
				errorNotice(
					// translators: "reason" is why creating a workflow failed.
					sprintf( __( 'Failed to create workflow: %(reason)s' ), { reason: error.message } ),
					{
						...noticeOptions,
					}
				)
			);
		},
	} );

	const [ workflowsValidations, setWorkflowValidations ] = useState< WorkflowsValidationItem[] >( [
		{
			label: __( 'The workflow file is a valid YAML' ),
			key: 'valid_yaml_file',
			item: (
				<div>
					<p>
						{ __(
							"Ensure that your workflow file contains a valid YAML structure. Here's an example:"
						) }
					</p>
					<pre>
						<code ref={ yamlCodeRef } className="language-yaml">
							{ NewWorkflowExample( repository.default_branch ) }
						</code>
					</pre>
				</div>
			),
			status: 'loading',
		},
		{
			label: __( 'The workflow is triggered on push' ),
			key: 'triggered_on_push',
			item: (
				<div>
					<p>{ __( 'Ensure that your workflow triggers on code push.' ) }</p>
					<pre>
						<code ref={ yamlCodeRef } className="language-yaml">
							{ CodePushExample( repository.default_branch ) }
						</code>
					</pre>
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
					<pre>
						<code ref={ yamlCodeRef } className="language-yaml">
							{ UploadArtifactExample() }
						</code>
					</pre>
				</div>
			),
			status: 'loading',
		},
	] );

	const handleDeploymentStyleChange = ( value: DeploymentStyle ) => {
		setDeploymentStyle( value );
	};

	const handleWorkflowChange = ( workflowFilename: Workflows ) => {
		setSelectedWorkflow( workflowFilename );
	};

	const handleVerifyWorkflow = () => {
		refetchWorkflowValidation();
	};

	const installWorkflow = async () => {
		createDeployment( {
			repositoryId: repository.id,
			branchName: branchName,
			repository: repository,
			fileName: defaultWorkflowFilepath,
			fileContent: NewWorkflowExample( repository.default_branch ),
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
		const invalidYaml = workflowCheckResult?.checked_items?.find( ( checkedItem ) => {
			return checkedItem.validation_name === 'valid_yaml_file' && checkedItem.status === 'error';
		} );

		if ( invalidYaml ) {
			setIsYamlValid( false );
		} else {
			setIsYamlValid( true );
		}

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
		if ( deploymentStyle === 'simple' || isTemplateRepository ) {
			onValidationChange?.( 'success' );
		} else {
			onValidationChange?.( workflowCheckResult?.conclusion || 'loading' );
		}
	}, [ onValidationChange, deploymentStyle, workflowCheckResult ] );

	useEffect( () => {
		if ( deploymentStyle === 'custom' && selectedWorkflow.workflow_path === 'create-new' ) {
			setIsCreatingNewWorkflow( true );
		} else {
			setIsCreatingNewWorkflow( false );
		}

		if (
			selectedWorkflow.workflow_path === 'create-new' ||
			selectedWorkflow.workflow_path === 'none' ||
			deploymentStyle === 'simple'
		) {
			onChooseWorkflow?.( undefined );
		} else {
			onChooseWorkflow?.( selectedWorkflow.workflow_path );
		}
	}, [ onChooseWorkflow, deploymentStyle, selectedWorkflow ] );

	useEffect( () => {
		if ( yamlCodeRef.current ) {
			Prism.highlightElement( yamlCodeRef.current );
		}
	}, [ workflowsValidations ] );

	const RenderValidationIcon = ( { validationStatus }: { validationStatus: WorkFlowStates } ) => {
		if ( ! isYamlValid ) {
			return <RenderIcon state="error" />;
		}
		if ( isCheckingWorkflowFile || isRefetchingWorkflowValidation ) {
			return <RenderIcon state="loading" />;
		}

		return <RenderIcon state={ validationStatus } />;
	};

	const shouldExpand = ( validation: WorkflowsValidationItem ) => {
		return (
			( isYamlValid && validation.status === 'error' ) ||
			( ! isYamlValid && validation.key === 'valid_yaml_file' )
		);
	};

	const ExternalWorkflowLink = () => {
		if ( isCheckingWorkflowFile || isRefetchingWorkflowValidation ) {
			return <Spinner />;
		}

		const hasAnyError = workflowCheckResult?.checked_items?.find( ( checkedItem ) => {
			return checkedItem.status === 'error';
		} );

		if ( hasAnyError ) {
			return (
				<p>
					{ translate( 'Please edit {{filename/}} and fix the problems we found:', {
						components: {
							filename: <ExternalLink href={ workflowFileUrl }>{ workflowFileName }</ExternalLink>,
						},
					} ) }
				</p>
			);
		}

		return (
			<p>
				{ translate( 'Your workflow {{filename/}} is good to go!', {
					components: {
						filename: <ExternalLink href={ workflowFileUrl }>{ workflowFileName }</ExternalLink>,
					},
				} ) }
			</p>
		);
	};

	return (
		<div className="github-deployments-deployment-style">
			<h3 style={ { fontSize: '16px', marginBottom: '16px' } }>
				{ __( 'Pick your deployment style' ) }
			</h3>
			<FormRadiosBar
				items={ [
					{ label: __( 'Simple' ), value: 'simple' },
					{ label: __( 'Advanced' ), value: 'custom' },
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
					<div className="github-deployments-deployment-style__workflow-selection">
						<SelectDropdown
							className="github-deployments-branch-select"
							selectedText={ selectedWorkflow.file_name }
							isLoading={ isFetchingWorkflows || isRefreshingWorkflows }
						>
							{ workflowsForRendering.map( ( workflowOption ) => (
								<SelectDropdown.Item
									key={ workflowOption.workflow_path }
									selected={ selectedWorkflow === workflowOption }
									onClick={ () => handleWorkflowChange( workflowOption ) }
								>
									{ workflowOption.file_name }
								</SelectDropdown.Item>
							) ) }
						</SelectDropdown>
						{ isWorkflowInvalid && (
							<FormInputValidation
								isError
								text={ translate( 'Please select a deployment workflow' ) }
							/>
						) }
					</div>
				</FormFieldset>
			) }

			{ ! isTemplateRepository && (
				<FormFieldset className="github-deployments-deployment-style__workflow-checks">
					{ deploymentStyle === 'custom' &&
						selectedWorkflow.workflow_path !== 'none' &&
						selectedWorkflow !== undefined &&
						! isCreatingNewWorkflow && (
							<>
								<FormLabel>{ __( 'Workflow check' ) }</FormLabel>
								<ExternalWorkflowLink />
								{ workflowsValidations.map( ( validation ) => (
									<div key={ validation.key }>
										<FoldableCard
											disabled={ validation.key !== 'valid_yaml_file' && ! isYamlValid }
											key={ validation.key }
											className={ validation.status === 'error' ? 'is-error' : '' }
											expanded={ shouldExpand( validation ) }
											header={
												<>
													<RenderValidationIcon validationStatus={ validation.status } />
													{ validation.label }
												</>
											}
											screenReaderText="More"
										>
											{ validation.item }
										</FoldableCard>
										{ validation.status === 'error' && (
											<FormInputValidation isError text={ translate( 'Please fix this error' ) } />
										) }
									</div>
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
									<pre>
										<code ref={ yamlCodeRef } className="language-yaml">
											{ NewWorkflowExample( repository.default_branch ) }
										</code>
									</pre>
								</div>
							</FoldableCard>
						</>
					) }
					{ deploymentStyle === 'custom' && selectedWorkflow.workflow_path !== 'none' && (
						<div className="github-deployments-deployment-style__actions">
							{ ! isCreatingNewWorkflow && (
								<Button
									type="button"
									busy={ isCheckingWorkflowFile || isRefetchingWorkflowValidation }
									className="button form-button"
									onClick={ handleVerifyWorkflow }
								>
									{ __( 'Verify workflow' ) }
								</Button>
							) }
							{ /* { workflowCheckResult?.conclusion === 'error' && (
							<Button type="button" className="button form-button" onClick={ fixWorfklow }>
								{ __( 'Fix workflow for me' ) }
							</Button>
						) } */ }
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
			) }
		</div>
	);
};
