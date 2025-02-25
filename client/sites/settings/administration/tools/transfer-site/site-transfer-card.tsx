import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import HeaderCakeBack from 'calypso/components/header-cake/back';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { Panel, PanelCard } from 'calypso/components/panel';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { useRemoveDuplicateViewsExperimentEnabled } from 'calypso/lib/remove-duplicate-views-experiment';
import { useSetFeatureBreadcrumb } from '../../../../hooks/breadcrumbs/use-set-feature-breadcrumb';

export function SiteTransferCard( {
	children,
	siteId,
	onClick,
}: {
	children: React.ReactNode;
	siteId: number;
	onClick: () => void;
} ) {
	const translate = useTranslate();
	const isUntangled = useRemoveDuplicateViewsExperimentEnabled();
	const title = isUntangled ? translate( 'Transfer site' ) : translate( 'Site Transfer' );

	useSetFeatureBreadcrumb( { siteId, title } );

	return (
		<Panel className="settings-administration__transfer-site">
			{ ! ( isUntangled && config.isEnabled( 'untangling/settings-i2' ) ) && (
				<HeaderCakeBack icon="chevron-left" onClick={ onClick } />
			) }
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
