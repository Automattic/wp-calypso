import page from '@automattic/calypso-router';
import { useI18n } from '@wordpress/react-i18n';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { GitHubLoadingPlaceholder } from '../components/loading-placeholder';
import { PageShell } from '../components/page-shell';
import { GitHubBrowseRepositories } from '../components/repositories/browse-repositories';
import { createDeploymentPage } from '../routes';
import { useGithubInstallationsQuery } from '../use-github-installations-query';
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

	const { data: installations, isLoading: isLoadingInstallations } = useGithubInstallationsQuery();
	const { data: deployments } = useCodeDeploymentsQuery( siteId );

	const hasConnectedAnInstallation = installations && installations.length > 0;
	const hasDeployments = deployments && deployments.length > 0;

	const renderTopRightButton = () => {
		if ( hasConnectedAnInstallation && hasDeployments ) {
			return (
				<ConnectionWizardButton
					onClick={ () => {
						page( createDeploymentPage( siteSlug! ) );
					} }
				/>
			);
		}

		if ( hasDeployments && ! hasConnectedAnInstallation ) {
			return <GitHubAuthorizeButton />;
		}

		return null;
	};

	const renderContent = () => {
		if ( deployments?.length ) {
			return <GitHubDeploymentsList deployments={ deployments } />;
		}

		if ( installations ) {
			return (
				<GitHubBrowseRepositories
					onSelectRepository={ ( installation, repository ) => {
						page(
							createDeploymentPage( siteSlug!, {
								installationId: installation.external_id,
								repositoryId: repository.id,
							} )
						);
					} }
				/>
			);
		}

		if ( ! installations && ! isLoadingInstallations ) {
			return <GitHubAuthorizeCard />;
		}

		return <GitHubLoadingPlaceholder />;
	};

	return (
		<PageShell pageTitle={ __( 'GitHub Deployments' ) } topRightButton={ renderTopRightButton() }>
			{ renderContent() }
		</PageShell>
	);
}
