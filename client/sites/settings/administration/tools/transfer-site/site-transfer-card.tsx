import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel, PanelCard } from 'calypso/components/panel';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useSetFeatureBreadcrumb } from '../../../../hooks/breadcrumbs/use-set-feature-breadcrumb';

export function SiteTransferCard( {
	children,
	siteId,
}: {
	children: React.ReactNode;
	siteId: number;
} ) {
	const translate = useTranslate();
	const title = translate( 'Transfer site' );

	useSetFeatureBreadcrumb( { siteId, title } );

	return (
		<Panel className="settings-administration__transfer-site">
			<NavigationHeader
				title={ title }
				subtitle={ translate(
					'Transfer this site to a new or existing site member with just a few clicks. {{a}}Learn more.{{/a}}',
					{
						components: {
							a: <InlineSupportLink supportContext="site-transfer" showIcon={ false } />,
						},
					}
				) }
			/>

			<PageViewTracker
				path="/settings/start-site-transfer/:site"
				title="Settings > Start Site Transfer"
			/>
			<PanelCard>{ children }</PanelCard>
		</Panel>
	);
}
