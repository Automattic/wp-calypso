import { useTranslate } from 'i18n-calypso';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import InlineSupportLink from 'calypso/components/inline-support-link';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import { Panel } from 'calypso/components/panel';
import { useSelector } from 'calypso/state';
import { useSelectedSiteSelector } from 'calypso/state/sites/hooks';
import {
	getSiteAdminUrl,
	isAdminInterfaceWPAdmin,
	isJetpackSite,
} from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SharingButtons from './buttons';

import './style.scss';

export default function MarketingSharing() {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isJetpack = useSelectedSiteSelector( isJetpackSite );
	const adminInterfaceIsWPAdmin = useSelectedSiteSelector( isAdminInterfaceWPAdmin );
	const siteAdminUrl = useSelectedSiteSelector( getSiteAdminUrl );

	const renderNotice = () => {
		return (
			<Notice showDismiss={ false } status="is-info">
				{ translate( 'Manage your sharing settings on {{a}}Jetpack{{/a}}.', {
					components: {
						a: <a href={ `${ siteAdminUrl }admin.php?page=jetpack#/sharing` }></a>,
					},
				} ) }
			</Notice>
		);
	};

	return (
		<Panel wide className="marketing-sharing">
			{ siteId && <QueryJetpackModules siteId={ siteId } /> }
			<NavigationHeader
				title={ translate( 'Sharing' ) }
				subtitle={ translate(
					'Make it easy for your readers to share your content online. {{learnMoreLink/}}',
					{
						components: {
							learnMoreLink: (
								<InlineSupportLink key="sharing" supportContext="sharing" showIcon={ false } />
							),
						},
					}
				) }
			/>
			{ isJetpack && adminInterfaceIsWPAdmin ? renderNotice() : <SharingButtons /> }
		</Panel>
	);
}
