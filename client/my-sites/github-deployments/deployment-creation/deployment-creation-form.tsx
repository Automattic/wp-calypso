import page from '@automattic/calypso-router';
import { __, sprintf } from '@wordpress/i18n';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { useDispatch, useSelector } from '../../../state';
import { GitHubConnectionForm } from '../components/github-connection-form';
import { GitHubLoadingPlaceholder } from '../components/loading-placeholder';
import { createDeploymentPage } from '../routes';
import { useGithubAccountsQuery } from '../use-github-accounts-query';
import { useGithubRepositoriesQuery } from '../use-github-repositories-query';
import { useCreateCodeDeployment } from './use-create-code-deployment';

const noticeOptions = {
	duration: 3000,
};

interface GitHubDeploymentCreationFormProps {
	installationId: number;
	repositoryId: number;
	onConnected(): void;
}

export const GitHubDeploymentCreationForm = ( {
	installationId,
	repositoryId,
	onConnected,
}: GitHubDeploymentCreationFormProps ) => {
	const installation = useGithubAccountsQuery().data?.find(
		( installation ) => installation.external_id === installationId
	);
	const dispatch = useDispatch();

	const repository = useGithubRepositoriesQuery( installationId ).data?.find(
		( repository ) => repository.id === repositoryId
	);

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const { createDeployment } = useCreateCodeDeployment( siteId, {
		onSuccess: () => {
			dispatch( successNotice( __( 'Deployment created.' ), noticeOptions ) );
			onConnected();
		},
		onError: ( error ) => {
			dispatch(
				errorNotice(
					// translators: "reason" is why connecting the branch failed.
					sprintf( __( 'Failed create deployment: %(reason)s' ), { reason: error.message } ),
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

	if ( ! installation || ! repository ) {
		return <GitHubLoadingPlaceholder />;
	}

	return (
		<GitHubConnectionForm
			ctaLabel={ __( 'Connect repository' ) }
			account={ installation }
			repository={ repository }
			changeRepository={ () => {
				page.replace( createDeploymentPage( siteSlug!, { installationId } ) );
			} }
			onSubmit={ ( { externalRepositoryId, branchName, targetDir, installationId, isAutomated } ) =>
				createDeployment( {
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
