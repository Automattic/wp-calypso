import { createCodeDeploymentMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Icon,
	Notice,
	Spinner,
	ExternalLink,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { check, closeSmall } from '@wordpress/icons';
import { useState, useEffect } from 'react';
import { CodeHighlighter } from '../../components/code-highlighter';
import { SectionHeader } from '../../components/section-header';
import { DEFAULT_WORKFLOW_TEMPLATE } from './workflow-yaml-examples';
import type { WorkflowValidationDefinition } from './advanced-workflow-validation';
import type {
	GitHubWorkflowValidation,
	GitHubWorkflowValidationItem,
	GitHubRepository,
} from '@automattic/api-core';

interface Workflow {
	file_name: string;
	workflow_path: string;
}

interface WorkflowValidationListProps {
	validations: Record< string, WorkflowValidationDefinition >;
	result?: GitHubWorkflowValidation;
	isLoading: boolean;
	onVerify(): void;
	canVerify: boolean;
	repository?: Pick< GitHubRepository, 'id' | 'owner' | 'name' >;
	branchName: string;
	workflowPath?: string;
	onWorkflowCreated?: ( path: string ) => void | Promise< void >;
	disabled?: boolean;
	siteId: number;
	installationId: number;
	workflows?: Workflow[];
	isCreatingNewWorkflow?: boolean;
}

const getStatusIcon = ( status: GitHubWorkflowValidationItem[ 'status' ] | 'loading' ) => {
	if ( status === 'loading' ) {
		return <Spinner />;
	}

	const isSuccess = status === 'success';
	const fill = isSuccess ? '#008a20' : '#d63638';

	return <Icon icon={ isSuccess ? check : closeSmall } style={ { fill } } size={ 20 } />;
};

const WORKFLOWS_DIRECTORY = '.github/workflows/';
const RECOMMENDED_WORKFLOW_PATH = WORKFLOWS_DIRECTORY + 'wpcom.yml';

export const WorkflowValidationList = ( {
	validations,
	result,
	isLoading,
	onVerify,
	canVerify,
	repository,
	branchName,
	workflowPath,
	onWorkflowCreated,
	disabled = false,
	siteId,
	installationId,
	isCreatingNewWorkflow = false,
}: WorkflowValidationListProps ) => {
	const items = result?.checked_items ?? [];
	const [ expandedCards, setExpandedCards ] = useState< Set< string > >( new Set() );

	const { mutate: createDeployment, isPending: isInstallingWorkflow } = useMutation( {
		...createCodeDeploymentMutation( siteId ),
		onSuccess: async () => {
			await onWorkflowCreated?.( RECOMMENDED_WORKFLOW_PATH );
		},
	} );

	const [ installError, setInstallError ] = useState< string >();

	useEffect( () => {
		// Reset install error when component mounts or when repository changes
		setInstallError( undefined );
	}, [ repository ] );

	const handleInstallWorkflow = () => {
		if ( ! repository ) {
			return;
		}

		createDeployment( {
			external_repository_id: repository.id,
			branch_name: branchName,
			target_dir: '/',
			installation_id: installationId,
			is_automated: false,
			workflow_path: RECOMMENDED_WORKFLOW_PATH,
		} );
	};

	// Check if we should show the install workflow state
	const shouldShowInstallWorkflow = isCreatingNewWorkflow;

	const toggleCard = ( validationName: string ) => {
		setExpandedCards( ( prev ) => {
			const newSet = new Set( prev );
			if ( newSet.has( validationName ) ) {
				newSet.delete( validationName );
			} else {
				newSet.add( validationName );
			}
			return newSet;
		} );
	};

	const summaryMessage = () => {
		if ( ! result || ! repository || ! branchName ) {
			return null;
		}

		const workflowFile = result.workflow_path || workflowPath;
		if ( ! workflowFile ) {
			return null;
		}

		const workflowUrl = `https://github.com/${ repository.owner }/${ repository.name }/blob/${ branchName }/${ workflowFile }`;
		const message =
			result.conclusion === 'success'
				? createInterpolateElement( __( 'Your workflow <filename /> is good to go!' ), {
						filename: <ExternalLink href={ workflowUrl }>{ workflowFile }</ExternalLink>,
				  } )
				: createInterpolateElement(
						__( 'Please edit <filename /> and fix the problems we found.' ),
						{
							filename: <ExternalLink href={ workflowUrl }>{ workflowFile }</ExternalLink>,
						}
				  );

		return <Text>{ message }</Text>;
	};

	// Don't render anything if no workflow is selected and we're not creating a new one
	if ( ! workflowPath && ! isCreatingNewWorkflow ) {
		return null;
	}

	return (
		<VStack spacing={ 3 }>
			{ shouldShowInstallWorkflow && (
				<VStack spacing={ 3 }>
					<Text>
						{ __(
							'This workflow will be created in your repository and will handle automatic deployments to your WordPress.com site.'
						) }
					</Text>

					<div className="github-deployments-new-workflow-wizard__workflow-file">
						<div
							className="github-deployments-new-workflow-wizard__workflow-file-name"
							style={ {
								fontFamily: 'monospace',
								border: '1px solid #ddd',
								padding: '8px 12px',
								backgroundColor: '#f6f7f7',
								borderRadius: '4px',
								marginBottom: '12px',
							} }
						>
							{ RECOMMENDED_WORKFLOW_PATH }
						</div>
						<CodeHighlighter content={ DEFAULT_WORKFLOW_TEMPLATE } />
					</div>

					{ installError && (
						<Notice status="warning" isDismissible={ false }>
							{ installError }
						</Notice>
					) }

					<Button
						type="button"
						variant="secondary"
						disabled={ isInstallingWorkflow || disabled }
						isBusy={ isInstallingWorkflow }
						onClick={ handleInstallWorkflow }
					>
						{ __( 'Install workflow for me' ) }
					</Button>
				</VStack>
			) }

			{ workflowPath && ! isCreatingNewWorkflow && (
				<>
					<SectionHeader
						title={ __( 'Workflow check' ) }
						actions={
							<Button
								variant="secondary"
								onClick={ onVerify }
								disabled={ isLoading || ! canVerify }
								isBusy={ isLoading }
							>
								{ __( 'Verify workflow' ) }
							</Button>
						}
					/>

					{ summaryMessage() }

					{ ! result && ! isLoading && (
						<Notice status="info" isDismissible={ false }>
							<Text>{ __( 'Run a workflow check to validate your configuration.' ) }</Text>
						</Notice>
					) }

					{ items.map( ( item ) => {
						const validation = validations[ item.validation_name ];

						if ( ! validation ) {
							return null;
						}

						const isExpanded = expandedCards.has( item.validation_name );

						return (
							<Card key={ item.validation_name }>
								<CardBody style={ { padding: '16px' } }>
									<HStack
										spacing={ 2 }
										style={ { cursor: 'pointer' } }
										onClick={ () => toggleCard( item.validation_name ) }
									>
										<HStack spacing={ 2 } justify="flex-start" alignment="center">
											{ getStatusIcon( isLoading ? 'loading' : item.status ) }
											<Text weight={ 500 }>{ validation.label }</Text>
										</HStack>
									</HStack>

									{ isExpanded && (
										<VStack spacing={ 2 } style={ { marginTop: '12px' } }>
											<Text>{ validation.description }</Text>
											<CodeHighlighter content={ validation.content } />
										</VStack>
									) }
								</CardBody>
							</Card>
						);
					} ) }
				</>
			) }
		</VStack>
	);
};
