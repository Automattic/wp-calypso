import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import { CodeDeployments } from 'calypso/my-sites/github-deployments/deployments/index';
import { useSelector } from 'calypso/state/index';
import { getSelectedSiteId } from 'calypso/state/ui/selectors/index';
import { GitHubAuthorize } from './authorize';
import { GitHubConnect } from './connect';
import { GitHubLoadingPlaceholder } from './loading-placeholder';
import { useCodeDeploymentsQuery } from './use-code-deployments-query';
import { useGithubAccountsQuery } from './use-github-accounts-query';

import './style.scss';

// Follow test plan at D137459 to add your token for testing.

type Tab = 'list' | 'connect';

export function GitHubDeployments() {
	const titleHeader = translate( 'GitHub Deployments' );
	const siteId = useSelector( getSelectedSiteId ) as number;
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

	const renderContent = () => {
		if ( isLoadingAccounts || isLoadingDeployments ) {
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
			<div className="github-deployments__page-header">
				<DocumentHead title={ titleHeader } />
				<FormattedHeader
					align="left"
					headerText={ titleHeader }
					subHeaderText={ translate(
						"Changes pushed to the selected branch's repos will be automatically deployed. {{learnMoreLink}}Learn more{{/learnMoreLink}}.",
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink supportContext="site-monitoring" showIcon={ false } />
								),
							},
						}
					) }
				></FormattedHeader>
				{ showConnectButton && (
					<div>
						<Button primary onClick={ handleConnect }>
							{ translate( 'Connect repository' ) }
						</Button>
					</div>
				) }
			</div>
			{ renderContent() }
		</Main>
	);
}
