import page from '@automattic/calypso-router';
import { useI18n } from '@wordpress/react-i18n';
import { HostingCard } from 'calypso/components/hosting-card';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { GitHubDeploymentSurvey } from '../components/deployments-survey';
import { GitHubLoadingPlaceholder } from '../components/loading-placeholder';
import { PageShell } from '../components/page-shell';
import { GitHubDeploymentCreationForm } from '../deployment-creation/deployment-creation-form';
import { createDeploymentPage } from '../routes';
import { ConnectionWizardButton } from './connection-wizard-button';
import { GitHubDeploymentsList } from './deployments-list';
import { useCodeDeploymentsQuery } from './use-code-deployments-query';

import './styles.scss';

export function GitHubDeployments() {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const { __ } = useI18n();

	const { data: deployments, isLoading, refetch } = useCodeDeploymentsQuery( siteId );

	const renderContent = () => {
		if ( deployments?.length ) {
			return (
				<>
					<GitHubDeploymentsList deployments={ deployments } />
					{ deployments.some( ( deployment ) => deployment.current_deployed_run !== null ) && (
						<GitHubDeploymentSurvey />
					) }
				</>
			);
		}

		if ( isLoading ) {
			return <GitHubLoadingPlaceholder />;
		}

		return (
			<HostingCard>
				<GitHubDeploymentCreationForm onConnected={ refetch } />
			</HostingCard>
		);
	};

	return (
		<PageShell
			pageTitle={ __( 'Deployments' ) }
			topRightButton={
				deployments &&
				deployments?.length > 0 && (
					<ConnectionWizardButton
						onClick={ () => {
							page( createDeploymentPage( siteSlug! ) );
						} }
					/>
				)
			}
		>
			{ renderContent() }
		</PageShell>
	);
}
