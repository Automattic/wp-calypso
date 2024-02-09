import { translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state/index';
import { getSelectedSiteId } from 'calypso/state/ui/selectors/index';
import { GitHubAuthorize } from './authorize';
import { GitHubConnected } from './connected';
import { GitHubLoadingPlaceholder } from './loading-placeholder';
import { useGithubConnectionQuery } from './use-github-connection-query';

import './style.scss';
import { CreateRepository } from './components/create-repository';

export function GitHubDeployments() {
	const titleHeader = translate( 'GitHub Deployments' );

	const siteId = useSelector( getSelectedSiteId );
	const { data: connections, isLoading } = useGithubConnectionQuery( siteId );

	const renderContent = () => {
		if ( isLoading ) {
			return <GitHubLoadingPlaceholder />;
		}
		if ( connections?.length ) {
			return <GitHubConnected />;
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
			<CreateRepository />
		</Main>
	);
}
