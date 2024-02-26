import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ActionPanel from '../../../components/action-panel';
import HeaderCake from '../../../components/header-cake';
import { PageShell } from '../components/page-shell';
import { GitHubBrowseRepositories } from '../components/repositories/browse-repositories';
import { useCodeDeploymentsQuery } from '../deployments/use-code-deployments-query';
import { createDeploymentPage, indexPage } from '../routes';
import { GitHubDeploymentCreationForm } from './deployment-creation-form';

interface GitHubConnectedProps {
	installationId?: number;
	repositoryId?: number;
}

export const GitHubDeploymentCreation = ( {
	installationId,
	repositoryId,
}: GitHubConnectedProps ) => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const { data } = useCodeDeploymentsQuery( siteId! );

	const goToDeployments = () => page( indexPage( siteSlug! ) );

	const goToRepositorySelection = () =>
		page(
			createDeploymentPage( siteSlug!, {
				installationId: installationId,
			} )
		);

	const getBackButton = () => {
		if ( installationId && repositoryId ) {
			return goToRepositorySelection;
		}

		if ( data?.length ) {
			return goToDeployments;
		}
	};

	const renderContent = () => {
		return (
			<>
				{ installationId && repositoryId ? (
					<GitHubDeploymentCreationForm
						installationId={ installationId }
						repositoryId={ repositoryId }
						onConnected={ goToDeployments }
					/>
				) : (
					<GitHubBrowseRepositories
						initialInstallationId={ installationId }
						onSelectRepository={ ( installation, repository ) => {
							page(
								createDeploymentPage( siteSlug!, {
									installationId: installation.external_id,
									repositoryId: repository.id,
								} )
							);
						} }
					/>
				) }
			</>
		);
	};

	return (
		<PageShell pageTitle={ __( 'Connect GitHub repository' ) }>
			<HeaderCake onClick={ getBackButton() } isCompact>
				<h1>{ __( 'Connect repository' ) }</h1>
			</HeaderCake>
			<ActionPanel>{ renderContent() }</ActionPanel>
		</PageShell>
	);
};
