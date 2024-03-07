import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import SupportInfo from 'calypso/components/support-info/index';
import { GitHubRepositoryData } from 'calypso/my-sites/github-deployments/use-github-repositories-query';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { AdvancedWorkflowStyle } from './advanced-workflow-style';
import { DeploymentStyleContext, DeploymentStyleContextProps } from './context';
import { useDeploymentWorkflowsQuery } from './use-deployment-workflows-query';
import { CREATE_WORKFLOW_OPTION } from './workflow-picker';

import './style.scss';

type DeploymentStyleProps = {
	isDisabled: boolean;
	repository?: GitHubRepositoryData;
	branchName: string;
	workflowPath?: string;
	onChooseWorkflow( workflowFilename: string | undefined ): void;
	useComposerWorkflow: boolean;
} & DeploymentStyleContextProps;

export const DeploymentStyle = ( {
	isDisabled,
	repository,
	branchName,
	workflowPath,
	onChooseWorkflow,
	isCheckingWorkflow,
	onWorkflowVerify,
	workflowCheckResult,
	useComposerWorkflow,
}: DeploymentStyleProps ) => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const {
		data: workflows,
		isLoading,
		isFetching,
		refetch,
	} = useDeploymentWorkflowsQuery( repository, branchName, {
		refetchOnWindowFocus: false,
		enabled: ! isDisabled,
	} );

	return (
		<div className="github-deployments-deployment-style">
			<div className="github-deployments-deployment-style__header">
				<h3>{ __( 'Pick your deployment mode' ) }</h3>
				<SupportInfo
					text={ __(
						'Simple deployments copy all of your repository files to the specified destination directory. ' +
							'Advanced deployments use a Workflow script that allows you to run custom build steps, such as, install Composer dependencies, test your code before deploying, and control the files that are deployed to your site.'
					) }
					link="https://docs.github.com/en/actions/using-workflows"
					privacyLink={ false }
				/>
			</div>
			<FormRadiosBar
				disabled={ isDisabled }
				items={ [
					{
						label: __( 'Simple' ),
						value: 'simple',
					},
					{ label: __( 'Advanced' ), value: 'advanced' },
				] }
				checked={ workflowPath ? 'advanced' : 'simple' }
				onChange={ ( event ) => {
					if ( event.target.value === 'simple' ) {
						onChooseWorkflow( undefined );
					} else {
						onChooseWorkflow( workflows?.[ 0 ]?.workflow_path ?? CREATE_WORKFLOW_OPTION );
					}
				} }
			/>

			{ repository && workflowPath && (
				<DeploymentStyleContext.Provider
					value={ {
						isCheckingWorkflow,
						onWorkflowVerify,
						workflowCheckResult,
					} }
				>
					<AdvancedWorkflowStyle
						repository={ repository }
						branchName={ branchName }
						workflowPath={ workflowPath }
						onNewWorkflowVerification={ async ( path: string ) => {
							const { data: newWorkflows } = await refetch();

							if ( ! newWorkflows?.find( ( workflow ) => workflow.workflow_path === path ) ) {
								dispatch(
									errorNotice(
										// translators: workflowPath is the GitHub repo workflow path
										sprintf( __( 'Could not find workflow with path %(workflowPath)s' ), {
											workflowPath: path,
										} ),
										{
											duration: 5000,
										}
									)
								);
								return;
							}

							onChooseWorkflow( path );
						} }
						onWorkflowCreation={ async ( path ) => {
							await refetch();
							onChooseWorkflow( path );
						} }
						onChooseWorkflow={ onChooseWorkflow }
						workflows={ workflows }
						isLoading={ isLoading }
						isFetching={ isFetching }
						useComposerWorkflow={ useComposerWorkflow }
					/>
				</DeploymentStyleContext.Provider>
			) }
		</div>
	);
};
