import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import { HostingCard } from 'calypso/components/hosting-card';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { GitHubLoadingPlaceholder } from '../components/loading-placeholder';
import { PageShell } from '../components/page-shell';
import { indexPage } from '../routes';
import { GitHubDeploymentManagementForm } from './deployment-management-form';
import { useCodeDeploymentQuery } from './use-code-deployment-query';

interface GitHubDeploymentManagementProps {
	codeDeploymentId: number;
}

export const GitHubDeploymentManagement = ( {
	codeDeploymentId,
}: GitHubDeploymentManagementProps ) => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const { data: codeDeployment } = useCodeDeploymentQuery( siteId, codeDeploymentId );

	const goToDeployments = () => {
		page( indexPage( siteSlug! ) );
	};

	const renderContent = () => {
		if ( ! codeDeployment ) {
			return <GitHubLoadingPlaceholder />;
		}

		return (
			<GitHubDeploymentManagementForm
				codeDeployment={ codeDeployment }
				onUpdated={ goToDeployments }
			/>
		);
	};

	return (
		<PageShell pageTitle={ __( 'Manage GitHub connection' ) }>
			<HeaderCakeBack icon="chevron-left" onClick={ goToDeployments } />
			<HostingCard>{ renderContent() }</HostingCard>
		</PageShell>
	);
};
