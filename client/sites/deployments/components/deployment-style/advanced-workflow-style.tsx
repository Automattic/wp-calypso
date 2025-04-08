import { ExternalLink } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
import { useWorkflowTemplate } from '../deployment-style/use-get-workflow-template-query';
import { NewWorkflowWizard } from './new-workflow-wizard';
import { Workflow } from './use-deployment-workflows-query';
import { WorkflowPicker } from './workflow-picker';
import { WorkflowValidationWizard } from './workflow-validation-wizard';

type AdvancedWorkflowStyleProps = {
	repository: Pick< GitHubRepositoryData, 'id' | 'owner' | 'name' >;
	branchName: string;
	workflowPath?: string;
	workflows?: Workflow[];
	isLoading: boolean;
	isFetching: boolean;
	useComposerWorkflow: boolean;
	onWorkflowCreation( path: string ): void;
	onChooseWorkflow( path: string ): void;
};

export const AdvancedWorkflowStyle = ( {
	workflows,
	isLoading,
	isFetching,
	repository,
	branchName,
	workflowPath,
	onWorkflowCreation,
	onChooseWorkflow,
	useComposerWorkflow,
}: AdvancedWorkflowStyleProps ) => {
	const templateName = useComposerWorkflow ? 'with_composer' : 'simple';

	const { data: template } = useWorkflowTemplate( { branchName, template: templateName } );

	const getContent = () => {
		const workflow = workflows?.find( ( workflow ) => workflow.workflow_path === workflowPath );

		const templateContents = template?.template ?? '';

		if ( ! workflow ) {
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
			<WorkflowValidationWizard
				repository={ repository }
				branchName={ branchName }
				workflow={ workflow }
				validYamlFile={ templateContents }
			/>
		);
	};

	return (
		<div>
			<WorkflowPicker
				isLoading={ isLoading || isFetching }
				workflows={ workflows }
				onChange={ onChooseWorkflow }
				value={ workflowPath }
			/>

			<p
				css={ { marginTop: 16, marginBottom: 0 } }
				className="github-deployments-deployment-style__workflow-recipes"
			>
				{ createInterpolateElement(
					translate(
						'You can start with our basic workflow file and extend it. Looking for inspiration? Check out our <a>workflow recipes</a>.'
					),
					{
						a: (
							<ExternalLink href="https://developer.wordpress.com/docs/developer-tools/github-deployments/github-deployments-workflow-recipes/" />
						),
					}
				) }
			</p>

			{ isLoading ? null : <div css={ { marginTop: '16px' } }>{ getContent() }</div> }
		</div>
	);
};
