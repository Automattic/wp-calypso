import { useTranslate } from 'i18n-calypso';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel, PanelSection } from 'calypso/components/panel';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { isHostingMenuUntangled } from 'calypso/sites/settings/utils';

export function SiteTransferCard( {
	children,
	onClick,
}: {
	children: React.ReactNode;
	onClick: () => void;
} ) {
	const translate = useTranslate();
	const title = isHostingMenuUntangled()
		? translate( 'Transfer site' )
		: translate( 'Site Transfer' );
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
			<HeaderCakeBack icon="chevron-left" onClick={ onClick } />
			<PanelSection>{ children }</PanelSection>
		</Panel>
	);
}
