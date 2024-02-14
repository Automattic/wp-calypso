import { translate } from 'i18n-calypso';
import { ReactNode } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';

interface GitHubDeploymentsProps {
	topRightButton?: ReactNode;
	pageTitle: string;
	children: ReactNode;
}

export function PageShell( { topRightButton, pageTitle, children }: GitHubDeploymentsProps ) {
	return (
		<Main className="github-deployments" fullWidthLayout>
			<DocumentHead title={ pageTitle } />
			<NavigationHeader
				compactBreadcrumb
				title={ translate( 'GitHub Deployments' ) }
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
				{ topRightButton }
			</NavigationHeader>
			{ children }
		</Main>
	);
}
