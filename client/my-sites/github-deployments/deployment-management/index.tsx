import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import ActionPanel from '../../../components/action-panel';
import HeaderCake from '../../../components/header-cake';
import { useSelector } from '../../../state';
import { GitHubLoadingPlaceholder } from '../components/loading-placeholder';
import { PageShell } from '../components/page-shell/page-shell';
import { indexPage } from '../routes';
import { GitHubDeploymentManagementForm } from './deployment-management-form';
import { useCodeDeploymentQuery } from './use-code-deployment-query';

import './style.scss';

interface GitHubConnectedProps {
	codeDeploymentId: number;
}

export const GitHubDeploymentManagement = ( { codeDeploymentId }: GitHubConnectedProps ) => {
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
			<HeaderCake onClick={ goToDeployments } isCompact>
				<h1>{ __( 'Manage connection' ) }</h1>
			</HeaderCake>
			<ActionPanel>{ renderContent() }</ActionPanel>
		</PageShell>
	);
};
