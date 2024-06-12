import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import ActionPanel from 'calypso/components/action-panel';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { PageShell } from '../components/page-shell';
import { useCodeDeploymentsQuery } from '../deployments/use-code-deployments-query';
import { indexPage } from '../routes';
import { GitHubDeploymentCreationForm } from './deployment-creation-form';

export const GitHubDeploymentCreation = () => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const { data } = useCodeDeploymentsQuery( siteId! );

	const goToDeployments = () => page( indexPage( siteSlug! ) );

	return (
		<PageShell pageTitle={ __( 'Connect GitHub repository' ) }>
			<HeaderCakeBack icon="chevron-left" onClick={ data?.length ? goToDeployments : undefined } />
			<ActionPanel>
				<GitHubDeploymentCreationForm onConnected={ goToDeployments } />
			</ActionPanel>
		</PageShell>
	);
};
