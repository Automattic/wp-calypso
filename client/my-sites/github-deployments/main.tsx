import { translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import { GitHubAuthorize } from './authorize';
import { GitHubConnected } from './connected';
import { GitHubLoadingPlaceholder } from './loading-placeholder';
import { useGithubAccountsQuery } from './use-github-accounts-query';

import './style.scss';

// Follow test plan at D137459 to add your token for testing.

export function GitHubDeployments() {
	const titleHeader = translate( 'GitHub Deployments' );

	const { data: accounts, isLoading } = useGithubAccountsQuery();

	const renderContent = () => {
		if ( isLoading ) {
			return <GitHubLoadingPlaceholder />;
		}
		if ( accounts.length ) {
			return <GitHubConnected accounts={ accounts } />;
		}
		return <GitHubAuthorize />;
	};

	return (
		<Main className="github-deployments" fullWidthLayout>
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
			{ renderContent() }
		</Main>
	);
}
