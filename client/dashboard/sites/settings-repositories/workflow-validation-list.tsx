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
import { useState } from 'react';
import { CodeHighlighter } from '../../components/code-highlighter';
import { SectionHeader } from '../../components/section-header';
import type { WorkflowValidationDefinition } from './advanced-workflow-validation';
import type {
	GitHubWorkflowValidation,
	GitHubWorkflowValidationItem,
	GitHubRepository,
} from '@automattic/api-core';
interface WorkflowValidationListProps {
	validations: Record< string, WorkflowValidationDefinition >;
	result?: GitHubWorkflowValidation;
	isLoading: boolean;
	onVerify(): void;
	canVerify: boolean;
	repository?: Pick< GitHubRepository, 'owner' | 'name' >;
	branchName: string;
	workflowPath?: string;
}

const getStatusIcon = ( status: GitHubWorkflowValidationItem[ 'status' ] | 'loading' ) => {
	if ( status === 'loading' ) {
		return <Spinner />;
	}

	const isSuccess = status === 'success';
	const fill = isSuccess ? '#008a20' : '#d63638';

	return <Icon icon={ isSuccess ? check : closeSmall } style={ { fill } } size={ 20 } />;
};

export const WorkflowValidationList = ( {
	validations,
	result,
	isLoading,
	onVerify,
	canVerify,
	repository,
	branchName,
	workflowPath,
}: WorkflowValidationListProps ) => {
	const items = result?.checked_items ?? [];
	const [ expandedCards, setExpandedCards ] = useState< Set< string > >( new Set() );

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

	return (
		<VStack spacing={ 3 }>
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
		</VStack>
	);
};
