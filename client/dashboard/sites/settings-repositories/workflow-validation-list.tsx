import { githubWorkflowChecksQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
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
import { useState, useMemo } from 'react';
import { CodeHighlighter } from '../../components/code-highlighter';
import { SectionHeader } from '../../components/section-header';
import {
	DEFAULT_WORKFLOW_TEMPLATE,
	codePushExample,
	uploadArtifactExample,
} from './workflow-yaml-examples';
import type { GithubWorkflowValidationItem, GithubRepository } from '@automattic/api-core';

export interface WorkflowValidationDefinition {
	label: string;
	description: string;
	content: string;
}

interface WorkflowValidationListProps {
	repository: GithubRepository;
	branchName: string;
	workflowPath: string;
}

const getStatusIcon = ( status: GithubWorkflowValidationItem[ 'status' ] | 'loading' ) => {
	if ( status === 'loading' ) {
		return <Spinner />;
	}

	const isSuccess = status === 'success';
	const fill = isSuccess ? '#008a20' : '#d63638';

	return <Icon icon={ isSuccess ? check : closeSmall } style={ { fill } } size={ 20 } />;
};

export const WorkflowValidationList = ( {
	repository,
	branchName,
	workflowPath,
}: WorkflowValidationListProps ) => {
	const [ expandedCards, setExpandedCards ] = useState< Set< string > >( new Set() );

	// Define workflow validations
	const workflowValidations = useMemo< Record< string, WorkflowValidationDefinition > >( () => {
		return {
			valid_yaml_file: {
				label: __( 'The workflow file is a valid YAML' ),
				description: __(
					"Ensure that your workflow file contains a valid YAML structure. Here's an example:"
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

	const {
		data: workflowChecks,
		isFetching: isFetchingWorkflowChecks,
		refetch: refetchWorkflowChecks,
	} = useQuery( {
		...githubWorkflowChecksQuery(
			repository?.owner ?? '',
			repository?.name ?? '',
			branchName,
			workflowPath ?? ''
		),
		enabled: !! repository && !! branchName,
	} );

	const canVerifyWorkflow = Boolean( workflowPath && repository && branchName );

	const items = workflowChecks?.checked_items ?? [];

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
		if ( ! workflowChecks ) {
			return null;
		}

		const workflowFile = workflowChecks.workflow_path || workflowPath;

		const workflowUrl = `https://github.com/${ repository.owner }/${ repository.name }/blob/${ branchName }/${ workflowFile }`;
		const message =
			workflowChecks.conclusion === 'success'
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

	return (
		<VStack spacing={ 3 }>
			<SectionHeader
				title={ __( 'Workflow check' ) }
				level={ 3 }
				description={ summaryMessage() }
				actions={
					<Button
						variant="secondary"
						onClick={ () => refetchWorkflowChecks() }
						disabled={ isFetchingWorkflowChecks || ! canVerifyWorkflow }
						isBusy={ isFetchingWorkflowChecks }
					>
						{ __( 'Verify workflow' ) }
					</Button>
				}
			/>

			{ ! workflowChecks && ! isFetchingWorkflowChecks && (
				<Notice status="info" isDismissible={ false }>
					<Text>{ __( 'Run a workflow check to validate your configuration.' ) }</Text>
				</Notice>
			) }

			{ items.map( ( item ) => {
				const validation = workflowValidations[ item.validation_name ];

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
									{ getStatusIcon( isFetchingWorkflowChecks ? 'loading' : item.status ) }
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
		</VStack>
	);
};
