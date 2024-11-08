import { Button, FormLabel } from '@automattic/components';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
import { CodeHighlighter } from '../code-highlighter';
import { useDeploymentStyleContext } from './context';
import { Workflow } from './use-deployment-workflows-query';
import { useWorkflowValidations } from './use-workflow-validations';
import { WorkflowValidation } from './workflow-validation';

interface WorkflowValidationWizardProps {
	repository: Pick< GitHubRepositoryData, 'owner' | 'name' >;
	branchName: string;
	workflow: Workflow;
	validYamlFile: string;
}

export const WorkflowValidationWizard = ( {
	repository,
	branchName,
	workflow,
	validYamlFile,
}: WorkflowValidationWizardProps ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const validations = useWorkflowValidations( { branchName, validYamlFile } );
	const { workflowCheckResult, isCheckingWorkflow, onWorkflowVerify } = useDeploymentStyleContext();

	useEffect( () => {
		if ( ! workflowCheckResult ) {
			return;
		} else if ( workflowCheckResult.conclusion === 'error' ) {
			const checks: Record< string, string > = {};
			workflowCheckResult.checked_items.forEach( ( check ) => {
				checks[ check.validation_name ] = check.status;
			} );
			dispatch( recordTracksEvent( 'calypso_hosting_github_workflow_invalid', checks ) );
		} else {
			dispatch( recordTracksEvent( 'calypso_hosting_github_workflow_valid' ) );
		}
	}, [ workflowCheckResult?.conclusion ] );

	const getWorkflowCheckDescription = () => {
		if ( ! workflowCheckResult ) {
			return;
		}

		const workflowPath = `https://github.com/${ repository.owner }/${ repository.name }/blob/${ branchName }/${ workflow.workflow_path }`;
		const description =
			workflowCheckResult.conclusion === 'error'
				? createInterpolateElement( __( 'Your workflow <filename /> is good to go!' ), {
						filename: <ExternalLink href={ workflowPath }>{ workflow.file_name }</ExternalLink>,
				  } )
				: createInterpolateElement(
						__( 'Please edit <filename /> and fix the problems we found.' ),
						{
							filename: <ExternalLink href={ workflowPath }>{ workflow.file_name }</ExternalLink>,
						}
				  );

		return <p css={ { fontSize: '14px' } }>{ description }</p>;
	};

	return (
		<div>
			<FormLabel>{ __( 'Workflow check' ) }</FormLabel>
			{ getWorkflowCheckDescription() }
			{ workflowCheckResult?.checked_items.map( ( workflowCheck ) => {
				const validation = validations[ workflowCheck.validation_name ];

				if ( ! validation ) {
					return null;
				}

				return (
					<WorkflowValidation
						key={ validation.label }
						label={ validation.label }
						status={ isCheckingWorkflow ? 'loading' : workflowCheck.status }
					>
						<p>{ validation.description }</p>
						<CodeHighlighter content={ validation.content } />
					</WorkflowValidation>
				);
			} ) }
			<Button
				css={ { marginTop: '8px' } }
				type="button"
				className="button form-button"
				onClick={ () => {
					dispatch( recordTracksEvent( 'calypso_hosting_github_validate_workflow_click' ) );
					onWorkflowVerify();
				} }
				disabled={ isCheckingWorkflow }
				busy={ isCheckingWorkflow }
			>
				{ __( 'Verify workflow' ) }
			</Button>
		</div>
	);
};
