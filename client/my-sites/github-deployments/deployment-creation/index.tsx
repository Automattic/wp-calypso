import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ActionPanel from '../../../components/action-panel';
import HeaderCake from '../../../components/header-cake';
import { GitHubLoadingPlaceholder } from '../components/loading-placeholder';
import { PageShell } from '../components/page-shell';
import { GitHubBrowseRepositories } from '../components/repositories/browse-repositories';
import { createRepository, index } from '../routes';
import { useGithubAccountsQuery } from '../use-github-accounts-query';
import { GitHubDeploymentCreationForm } from './deployment-creation-form';

interface GitHubConnectedProps {
	installationId?: number;
	repositoryId?: number;
}

export const GitHubDeploymentCreation = ( {
	installationId,
	repositoryId,
}: GitHubConnectedProps ) => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const accounts = useGithubAccountsQuery().data;

	const goToDeployments = () => {
		page( index( siteSlug! ) );
	};

	const renderContent = () => {
		if ( ! accounts ) {
			return <GitHubLoadingPlaceholder />;
		}

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
						accounts={ accounts ?? [] }
						initialInstallationId={ installationId }
						onSelectRepository={ ( installation, repository ) => {
							page.replace(
								createRepository( siteSlug!, {
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
			<HeaderCake onClick={ goToDeployments } isCompact>
				<h1>{ __( 'Connect repository' ) }</h1>
			</HeaderCake>
			<ActionPanel>{ renderContent() }</ActionPanel>
		</PageShell>
	);
};
