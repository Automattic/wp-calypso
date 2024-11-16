import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import {
	getSiteAdminUrl,
	isAdminInterfaceWPAdmin,
	isJetpackSite,
} from 'calypso/state/sites/selectors';
import Traffic from './traffic';

export default function MarketingTraffic() {
	const translate = useTranslate();
	const isJetpack = useSelectedSiteSelector( isJetpackSite );
	const adminInterfaceIsWPAdmin = useSelectedSiteSelector( isAdminInterfaceWPAdmin );
	const siteAdminUrl = useSelectedSiteSelector( getSiteAdminUrl );

	const renderNotice = () => {
		return (
			<Notice showDismiss={ false } status="is-info">
				{ translate( 'Manage your traffic settings on {{a}}Jetpack{{/a}}.', {
					components: {
						a: <a href={ `${ siteAdminUrl }admin.php?page=jetpack#/traffic` }></a>,
					},
				} ) }
			</Notice>
		);
	};

	return (
		<div className="marketing-traffic">
			<NavigationHeader
				title={ translate( 'Traffic' ) }
				subtitle={ translate(
					'Manage settings and tools related to the traffic your website receives. {{learnMoreLink/}}',
					{
						components: {
							learnMoreLink: (
								<InlineSupportLink key="traffic" supportContext="traffic" showIcon={ false } />
							),
						},
					}
				) }
			/>
			{ isJetpack && adminInterfaceIsWPAdmin ? renderNotice() : <Traffic /> }
		</div>
	);
}
