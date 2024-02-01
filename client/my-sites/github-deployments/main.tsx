import { translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

export function GitHubDeployments() {
	const titleHeader = translate( 'GitHub Deployments' );

	return (
		<Main className="github-deployments" fullWidthLayout>
			<PageViewTracker path="/github-deployments/:site" title="GitHub Deployments" />
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
		</Main>
	);
}
