import { githubWorkflowTemplatesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, SelectControl, __experimentalText as Text } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { NewWorkflowWizard } from './new-workflow-wizard';
import { WorkflowValidationList } from './workflow-validation-list';
import type { GitHubRepository, GitHubWorkflow } from '@automattic/api-core';

type AdvancedWorkflowStyleProps = {
	repository?: GitHubRepository;
	branchName: string;
	workflowPath?: string;
	workflows: GitHubWorkflow[];
	isLoading: boolean;
	isFetching: boolean;
	useComposerWorkflow: boolean;
	onWorkflowCreation( path: string ): void;
	onChooseWorkflow( path: string ): void;
	siteId: number;
	installationId: number;
};

export const AdvancedWorkflowStyle = ( {
	isLoading,
	isFetching,
	repository,
	branchName,
	workflowPath,
	workflows,
	onWorkflowCreation,
	onChooseWorkflow,
	useComposerWorkflow,
	siteId,
	installationId,
}: AdvancedWorkflowStyleProps ) => {
	const templateName = useComposerWorkflow ? 'with_composer' : 'simple';

	const { data: template } = useQuery( {
		...githubWorkflowTemplatesQuery( branchName, templateName ),
		enabled: !! branchName,
	} );

	const workflowOptions = useMemo( () => {
		const options =
			workflows?.map( ( workflow ) => ( {
				label: workflow.file_name,
				value: workflow.workflow_path,
			} ) ) ?? [];

		// Add "Create new workflow" option
		options.push( {
			label: __( 'Create new workflow' ),
			value: 'CREATE_WORKFLOW_OPTION',
		} );

		return options;
	}, [ workflows ] );

	if ( ! repository ) {
		return null;
	}

	const getContent = () => {
		const workflow = workflows?.find( ( workflow ) => workflow.workflow_path === workflowPath );
		const isCreatingNewWorkflow = workflowPath === 'CREATE_WORKFLOW_OPTION';

		if ( ! workflow && ! isCreatingNewWorkflow ) {
			return null;
		}

		if ( isCreatingNewWorkflow ) {
			const templateContents = template?.template ?? '';
			return (
				<NewWorkflowWizard
					workflows={ workflows }
					repository={ repository }
					repositoryBranch={ branchName }
					onWorkflowCreated={ onWorkflowCreation }
					templateName={ templateName }
					exampleTemplate={ templateContents }
				/>
			);
		}

		return (
			<WorkflowValidationList
				repository={ repository }
				branchName={ branchName }
				workflowPath={ workflowPath }
				onWorkflowCreated={ onWorkflowCreation }
				disabled={ isLoading || isFetching }
				siteId={ siteId }
				installationId={ installationId }
				isCreatingNewWorkflow={ false }
			/>
		);
	};

	return (
		<div>
			<SelectControl
				label={ __( 'Deployment workflow' ) }
				value={ workflowPath ?? '' }
				onChange={ onChooseWorkflow }
				disabled={ isLoading || isFetching }
				options={ workflowOptions }
				__next40pxDefaultSize
			/>

			<Text
				variant="muted"
				style={ { marginTop: '16px', marginBottom: 0 } }
				className="github-deployments-deployment-style__workflow-recipes"
			>
				{ createInterpolateElement(
					__(
						'You can start with our basic workflow file and extend it. Looking for inspiration? Check out our <a>workflow recipes</a>.'
					),
					{
						a: (
							<ExternalLink href="https://developer.wordpress.com/docs/developer-tools/github-deployments/github-deployments-workflow-recipes/">
								{ __( 'workflow recipes' ) }
							</ExternalLink>
						),
					}
				) }
			</Text>

			{ isLoading ? null : <div style={ { marginTop: '16px' } }>{ getContent() }</div> }
		</div>
	);
};
