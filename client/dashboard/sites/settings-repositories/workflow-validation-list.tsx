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
import type { WorkflowValidationDefinition } from './use-workflow-validations';
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
	const background = isSuccess
		? 'var(--wp-admin-theme-color, #008a20)'
		: 'var(--wp--preset--color--alert-red, #d63638)';

	return (
		<span
			style={ {
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: 24,
				height: 24,
				borderRadius: '50%',
				background,
				color: '#fff',
			} }
		>
			<Icon icon={ isSuccess ? check : closeSmall } size={ 14 } />
		</span>
	);
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
			<HStack justify="space-between" alignment="center">
				<Text weight="600">{ __( 'Workflow check' ) }</Text>
				<Button
					variant="secondary"
					onClick={ onVerify }
					disabled={ isLoading || ! canVerify }
					isBusy={ isLoading }
				>
					{ __( 'Verify workflow' ) }
				</Button>
			</HStack>

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

				return (
					<Card
						key={ item.validation_name }
						style={
							isLoading || item.status !== 'error'
								? undefined
								: { border: '1px solid var(--wp--preset--color--alert-red, #d63638)' }
						}
					>
						<CardBody>
							<VStack spacing={ 2 }>
								<HStack spacing={ 2 } alignment="center">
									{ getStatusIcon( isLoading ? 'loading' : item.status ) }
									<Text weight="600">{ validation.label }</Text>
								</HStack>
								<Text>{ validation.description }</Text>
								<pre
									style={ {
										background: 'var(--wp--preset--color--neutral-0, #f6f7f7)',
										padding: '12px',
										borderRadius: '4px',
										overflowX: 'auto',
										margin: 0,
									} }
								>
									{ validation.content }
								</pre>
							</VStack>
						</CardBody>
					</Card>
				);
			} ) }
		</VStack>
	);
};
