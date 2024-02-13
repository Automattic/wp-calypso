import { translate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { useSelector } from 'calypso/state/index';
import { getSelectedSiteId } from 'calypso/state/ui/selectors/index';
import { GitHubAuthorize } from './authorize';
import { GitHubAuthorizeButton } from './authorize/authorize-button';
import { GitHubConnect } from './connect';
import { ConnectionWizardButton } from './connection-wizard-button';
import { CodeDeployments } from './deployments';
import { GitHubLoadingPlaceholder } from './loading-placeholder';
import { useCodeDeploymentsQuery } from './use-code-deployments-query';
import { useGithubAccountsQuery } from './use-github-accounts-query';
import './style.scss';

type Tab = 'list' | 'connect';

export function GitHubDeployments() {
	const titleHeader = translate( 'GitHub Deployments' );
	const siteId = useSelector( getSelectedSiteId );
	const [ tab, setTab ] = useState< Tab >( 'list' );

	const { data: accounts = [], isLoading: isLoadingAccounts } = useGithubAccountsQuery();
	const { data: deployments = [], isLoading: isLoadingDeployments } =
		useCodeDeploymentsQuery( siteId );

	const hasConnectedAnAccount = accounts?.length > 0;
	const showConnectButton = hasConnectedAnAccount && tab === 'list';

	const handleConnect = () => {
		setTab( 'connect' );
	};

	const handleList = () => {
		setTab( 'list' );
	};

	const renderTopRightButton = () => {
		if ( isLoadingDeployments || isLoadingAccounts ) {
			return null;
		}

		if ( showConnectButton ) {
			return <ConnectionWizardButton onClick={ handleConnect } />;
		}

		if ( deployments && ! accounts ) {
			return <GitHubAuthorizeButton />;
		}

		return null;
	};

	const renderContent = () => {
		if ( isLoadingDeployments || isLoadingAccounts ) {
			return <GitHubLoadingPlaceholder />;
		}

		if ( ! hasConnectedAnAccount ) {
			return <GitHubAuthorize />;
		}

		if ( tab === 'list' ) {
			return <CodeDeployments deployments={ deployments } />;
		}

		return <GitHubConnect accounts={ accounts } onBack={ handleList } />;
	};

	return (
		<Main className="github-deployments" fullWidthLayout>
			<DocumentHead title={ titleHeader } />
			<NavigationHeader
				compactBreadcrumb
				title={ titleHeader }
				subtitle={ translate(
					"Changes pushed to the selected branch's repos will be automatically deployed. {{learnMoreLink}}Learn more{{/learnMoreLink}}.",
					{
						components: {
							learnMoreLink: (
								<InlineSupportLink supportContext="site-monitoring" showIcon={ false } />
							),
						},
					}
				) }
			>
				{ renderTopRightButton() }
			</NavigationHeader>
			{ renderContent() }
		</Main>
	);
}
