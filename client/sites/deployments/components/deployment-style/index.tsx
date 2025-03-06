import { useI18n } from '@wordpress/react-i18n';
import FormRadiosBar from 'calypso/components/forms/form-radios-bar';
import { HostingCardHeading, HostingCardDescription } from 'calypso/components/hosting-card';
import SupportInfo from 'calypso/components/support-info/index';
import { GitHubRepositoryData } from '../../use-github-repositories-query';
import { AdvancedWorkflowStyle } from './advanced-workflow-style';
import { DeploymentStyleContext, DeploymentStyleContextProps } from './context';
import { useDeploymentWorkflowsQuery } from './use-deployment-workflows-query';
import { CREATE_WORKFLOW_OPTION } from './workflow-picker';

import './style.scss';

type DeploymentStyleProps = {
	isDisabled: boolean;
	repository?: Pick< GitHubRepositoryData, 'id' | 'owner' | 'name' >;
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

	const {
		data: workflows,
		isLoading,
		isFetching,
		refetch,
	} = useDeploymentWorkflowsQuery( repository, branchName, {
		refetchOnWindowFocus: false,
		enabled: ! isDisabled,
	} );

	const supportMessage = (
		<>
			<p>
				{ __( 'Simple deployments copy all of your repository files to a specified directory.' ) }
			</p>
			<p>
				{ __(
					'Advanced deployments allow you to use a workflow script, enabling custom build steps such as installing Composer dependencies, conducting pre-deployment code testing, and controlling file deployment.'
				) }
			</p>
		</>
	);

	return (
		<div className="github-deployments-deployment-style">
			<HostingCardHeading title={ __( 'Pick your deployment mode' ) }>
				<SupportInfo
					popoverClassName="github-deployments-deployments-style-popover"
					// @todo Move to contextLinks
					link="https://developer.wordpress.com/docs/developer-tools/github-deployments/github-deployments-workflow-recipes/"
					privacyLink={ false }
				>
					{ supportMessage }
				</SupportInfo>
			</HostingCardHeading>
			<HostingCardDescription>
				{ __(
					'Simple deployments copy repository files to a directory, while advanced deployments use scripts for custom build steps and testing.'
				) }
			</HostingCardDescription>
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
