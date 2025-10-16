import { githubWorkflowTemplatesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	ExternalLink,
	SelectControl,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { NewWorkflowWizard } from './new-workflow-wizard';
import { WorkflowValidationList } from './workflow-validation-list';
import type { GithubRepository, GithubWorkflow } from '@automattic/api-core';

type AdvancedWorkflowStyleProps = {
	repository: GithubRepository;
	branchName: string;
	workflowPath: string;
	workflows: GithubWorkflow[];
	isLoading: boolean;
	useComposerWorkflow: boolean;
	onWorkflowCreation( path: string ): void;
	onChooseWorkflow( path: string ): void;
};

export const AdvancedWorkflowStyle = ( {
	isLoading,
	repository,
	branchName,
	workflowPath,
	workflows,
	onWorkflowCreation,
	onChooseWorkflow,
	useComposerWorkflow,
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

	const getContent = () => {
		const workflow = workflows?.find( ( workflow ) => workflow.workflow_path === workflowPath );

		if ( ! workflow ) {
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
			/>
		);
	};

	return (
		<VStack spacing={ 4 }>
			<SelectControl
				label={ __( 'Deployment workflow' ) }
				value={ workflowPath ?? '' }
				onChange={ onChooseWorkflow }
				disabled={ isLoading }
				options={ workflowOptions }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>

			<Text variant="muted">
				{ createInterpolateElement(
					__(
						'You can start with our basic workflow file and extend it. Looking for inspiration? Check out our <a>workflow recipes</a>.'
					),
					{
						a: (
							<ExternalLink
								href="https://developer.wordpress.com/docs/developer-tools/github-deployments/github-deployments-workflow-recipes/"
								children={ null }
							/>
						),
					}
				) }
			</Text>

			{ isLoading ? null : getContent() }
		</VStack>
	);
};
