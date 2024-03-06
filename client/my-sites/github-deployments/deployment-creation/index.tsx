import page from '@automattic/calypso-router';
import { __ } from '@wordpress/i18n';
import ActionPanel from 'calypso/components/action-panel';
import HeaderCake from 'calypso/components/header-cake';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { PageShell } from '../components/page-shell';
import { indexPage } from '../routes';
import { GitHubDeploymentCreationForm } from './deployment-creation-form';

export const GitHubDeploymentCreation = () => {
	const siteSlug = useSelector( getSelectedSiteSlug );

	const goToDeployments = () => page( indexPage( siteSlug! ) );

	return (
		<PageShell pageTitle={ __( 'Connect GitHub repository' ) }>
			<HeaderCake onClick={ goToDeployments } isCompact>
				<h1>{ __( 'Connect repository' ) }</h1>
			</HeaderCake>
			<ActionPanel>
				<GitHubDeploymentCreationForm onConnected={ goToDeployments } />
			</ActionPanel>
		</PageShell>
	);
};
