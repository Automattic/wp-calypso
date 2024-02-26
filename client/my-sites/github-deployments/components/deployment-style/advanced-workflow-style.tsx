import { GitHubRepositoryData } from '../../use-github-repositories-query';
import { NewWorkflowWizard } from './new-workflow-wizard';
import { Workflow } from './use-deployment-workflows-query';
import { WorkflowPicker } from './workflow-picker';
import { WorkflowValidationWizard } from './workflow-validation-wizard';

type AdvancedWorkflowStyleProps = {
	repository: GitHubRepositoryData;
	branchName: string;
	workflowPath?: string;
	workflows?: Workflow[];
	isLoading: boolean;
	isFetching: boolean;
	onWorkflowCreation( path: string ): void;
	onNewWorkflowVerification( path: string ): void;
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
	onNewWorkflowVerification,
	onChooseWorkflow,
}: AdvancedWorkflowStyleProps ) => {
	const getContent = () => {
		const workflow = workflows?.find( ( workflow ) => workflow.workflow_path === workflowPath );

		if ( ! workflow ) {
			return (
				<NewWorkflowWizard
					isLoadingWorkflows={ isLoading || isFetching }
					workflows={ workflows }
					repository={ repository }
					repositoryBranch={ branchName }
					onWorkflowVerification={ onNewWorkflowVerification }
					onWorkflowCreated={ onWorkflowCreation }
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
