import page from '@automattic/calypso-router';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'calypso/state/index';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors/index';
import { GitHubLoadingPlaceholder } from '../components/loading-placeholder';
import { PageShell } from '../components/page-shell';
import { GitHubBrowseRepositories } from '../components/repositories/browse-repositories';
import { createRepository } from '../routes';
import { useGithubAccountsQuery } from '../use-github-accounts-query';
import { GitHubAuthorizeButton } from './authorize-button';
import { GitHubAuthorizeCard } from './authorize-card';
import { ConnectionWizardButton } from './connection-wizard-button';
import { GitHubDeploymentsList } from './deployments-list';
import { useCodeDeploymentsQuery } from './use-code-deployments-query';

import './styles.scss';

export function GitHubDeployments() {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const { __ } = useI18n();

	const { data: accounts = [], isLoading: isLoadingAccounts } = useGithubAccountsQuery();
	const { data: deployments = [], isLoading: isLoadingDeployments } =
		useCodeDeploymentsQuery( siteId );

	const hasConnectedAnAccount = accounts.length > 0;
	const hasDeployments = deployments.length > 0;

	const renderTopRightButton = () => {
		if ( isLoadingDeployments || isLoadingAccounts ) {
			return null;
		}

		if ( hasConnectedAnAccount && hasDeployments ) {
			return (
				<ConnectionWizardButton
					onClick={ () => {
						page( createRepository( siteSlug! ) );
					} }
				/>
			);
		}

		if ( hasDeployments && ! hasConnectedAnAccount ) {
			return <GitHubAuthorizeButton />;
		}

		return null;
	};

	const renderContent = () => {
		if ( isLoadingDeployments || isLoadingAccounts ) {
			return <GitHubLoadingPlaceholder />;
		}

		if ( hasDeployments ) {
			return <GitHubDeploymentsList deployments={ deployments } />;
		}

		if ( ! hasConnectedAnAccount ) {
			return <GitHubAuthorizeCard />;
		}

		return (
			<GitHubBrowseRepositories
				accounts={ accounts }
				onSelectRepository={ ( installation, repository ) => {
					page(
						createRepository( siteSlug!, {
							installationId: installation.external_id,
							repositoryId: repository.id,
						} )
					);
				} }
			/>
		);
	};

	return (
		<PageShell pageTitle={ __( 'GitHub Deployments' ) } topRightButton={ renderTopRightButton() }>
			{ renderContent() }
		</PageShell>
	);
}
