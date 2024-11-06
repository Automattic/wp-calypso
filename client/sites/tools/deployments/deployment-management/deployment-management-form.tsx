import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useDispatch, useSelector } from '../../../../state';
import { GitHubConnectionForm } from '../components/github-connection-form';
import { getDeploymentTypeFromPath } from '../deployment-creation/deployment-creation-form';
import { CodeDeploymentData } from '../deployments/use-code-deployments-query';
import { useUpdateCodeDeployment } from './use-update-code-deployment';

const noticeOptions = {
	duration: 3000,
};

interface GitHubDeploymentManagementFormProps {
	codeDeployment: CodeDeploymentData;
	onUpdated(): void;
}

export const GitHubDeploymentManagementForm = ( {
	codeDeployment,
	onUpdated,
}: GitHubDeploymentManagementFormProps ) => {
	const dispatch = useDispatch();

	const repository = useMemo( () => {
		const [ owner, name ] = codeDeployment.repository_name.split( '/' );

		return {
			id: codeDeployment.external_repository_id,
			owner,
			name,
		};
	}, [ codeDeployment ] );

	const siteId = useSelector( getSelectedSiteId );

	const { updateDeployment } = useUpdateCodeDeployment( siteId, codeDeployment.id, {
		onSuccess: ( data ) => {
			dispatch( successNotice( __( 'Deployment updated.' ), noticeOptions ) );
			dispatch(
				recordTracksEvent( 'calypso_hosting_github_update_deployment_success', {
					deployment_type: data ? getDeploymentTypeFromPath( data.target_dir ) : null,
					is_automated: data?.is_automated,
					workflow_path: data?.workflow_path,
				} )
			);
			onUpdated();
		},
		onError: ( error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_github_update_deployment_failure', {
					reason: error.code,
				} )
			);
			dispatch(
				errorNotice(
					// translators: "reason" is why connecting the branch failed.
					sprintf( __( 'Failed to create deployment: %(reason)s' ), { reason: error.message } ),
					{
						...noticeOptions,
					}
				)
			);
		},
	} );

	const initialValues = useMemo( () => {
		return {
			branch: codeDeployment.branch_name,
			destPath: codeDeployment.target_dir,
			isAutomated: codeDeployment.is_automated,
			workflowPath: codeDeployment.workflow_path,
		};
	}, [ codeDeployment ] );

	return (
		<GitHubConnectionForm
			installationId={ codeDeployment.installation_id }
			deploymentId={ codeDeployment.id }
			repository={ repository }
			initialValues={ initialValues }
			onSubmit={ ( {
				externalRepositoryId,
				branchName,
				targetDir,
				installationId,
				isAutomated,
				workflowPath,
			} ) =>
				updateDeployment( {
					externalRepositoryId,
					branchName,
					targetDir,
					installationId,
					isAutomated,
					workflowPath,
				} )
			}
		/>
	);
};
