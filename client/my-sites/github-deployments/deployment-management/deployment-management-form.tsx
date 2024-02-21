import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from 'react';
import { GitHubConnectionForm } from 'calypso/my-sites/github-deployments/components/github-connection-form';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useDispatch, useSelector } from '../../../state';
import { GitHubLoadingPlaceholder } from '../components/loading-placeholder';
import { CodeDeploymentData } from '../deployments/use-code-deployments-query';
import { useGithubInstallationsQuery } from '../use-github-installations-query';
import { useGithubRepositoriesQuery } from '../use-github-repositories-query';
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
	const installation = useGithubInstallationsQuery().data?.find(
		( installation ) => installation.external_id === codeDeployment?.installation_id
	);
	const dispatch = useDispatch();

	const repository = useGithubRepositoriesQuery( codeDeployment.installation_id ).data?.find(
		( repository ) => repository.id === codeDeployment.external_repository_id
	);

	const siteId = useSelector( getSelectedSiteId );

	const { updateDeployment } = useUpdateCodeDeployment( siteId, codeDeployment.id, {
		onSuccess: () => {
			dispatch( successNotice( __( 'Deployment updated.' ), noticeOptions ) );
			onUpdated();
		},
		onError: ( error ) => {
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
		onSettled: ( _, error ) => {
			dispatch(
				recordTracksEvent( 'calypso_hosting_github_create_deployment_success', {
					connected: ! error,
				} )
			);
		},
	} );

	const initialValues = useMemo( () => {
		return {
			branch: codeDeployment.branch_name,
			destPath: codeDeployment.target_dir,
			isAutomated: codeDeployment.is_automated,
		};
	}, [ codeDeployment ] );

	if ( ! installation || ! repository ) {
		return <GitHubLoadingPlaceholder />;
	}

	return (
		<GitHubConnectionForm
			installation={ installation }
			ctaLabel={ __( 'Update connection' ) }
			repository={ repository }
			initialValues={ initialValues }
			onSubmit={ ( { externalRepositoryId, branchName, targetDir, installationId, isAutomated } ) =>
				updateDeployment( {
					externalRepositoryId,
					branchName,
					targetDir,
					installationId,
					isAutomated,
				} )
			}
		/>
	);
};
