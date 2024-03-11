import page from '@automattic/calypso-router';
import { useI18n } from '@wordpress/react-i18n';
import ActionPanel from 'calypso/components/action-panel';
import HeaderCake from 'calypso/components/header-cake';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { GitHubLoadingPlaceholder } from '../components/loading-placeholder';
import { PageShell } from '../components/page-shell';
import { GitHubDeploymentCreationForm } from '../deployment-creation/deployment-creation-form';
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
	const {
		data: deployments,
		isLoading: isLoadingDeployments,
		refetch,
	} = useCodeDeploymentsQuery( siteId );

	const hasConnectedAnInstallation = installations && installations.length > 0;
	const hasDeployments = deployments && deployments.length > 0;
	const isLoading = isLoadingInstallations || isLoadingDeployments;
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
		if ( isLoading ) {
			return <GitHubLoadingPlaceholder />;
		}

		if ( deployments?.length ) {
			return <GitHubDeploymentsList deployments={ deployments } />;
		}

		if ( installations ) {
			return (
				<>
					<HeaderCake isCompact>
						<h1>{ __( 'Connect repository' ) }</h1>
					</HeaderCake>
					<ActionPanel>
						<GitHubDeploymentCreationForm onConnected={ refetch } />
					</ActionPanel>
				</>
			);
		}

		if ( ! installations && ! isLoadingInstallations ) {
			return <GitHubAuthorizeCard />;
		}
	};

	return (
		<PageShell pageTitle={ __( 'GitHub Deployments' ) } topRightButton={ renderTopRightButton() }>
			{ renderContent() }
		</PageShell>
	);
}
