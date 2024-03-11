import { GitHubRepositoryData } from '../../use-github-repositories-query';
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
	const getContent = () => {
		const workflow = workflows?.find( ( workflow ) => workflow.workflow_path === workflowPath );

		if ( ! workflow ) {
			return (
				<NewWorkflowWizard
					workflows={ workflows }
					repository={ repository }
					repositoryBranch={ branchName }
					onWorkflowCreated={ onWorkflowCreation }
					useComposerWorkflow={ useComposerWorkflow }
				/>
			);
		}

		return (
			<WorkflowValidationWizard
				repository={ repository }
				branchName={ branchName }
				workflow={ workflow }
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

			{ isLoading ? null : <div css={ { marginTop: '16px' } }>{ getContent() }</div> }
		</div>
	);
};
