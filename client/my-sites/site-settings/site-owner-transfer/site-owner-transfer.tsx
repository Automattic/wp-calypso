import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { TRANSFER_SITE } from 'calypso/lib/url/support';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PendingDomainTransfer from './pending-domain-transfer';
import StartSiteOwnerTransfer from './start-site-owner-transfer';

const SiteOwnerTransfer = () => {
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );

	const translate = useTranslate();
	const nonWpcomDomains = useSelector( ( state ) =>
		getDomainsBySiteId( state, selectedSite?.ID )
	)?.filter( ( domain ) => ! domain.isWPCOMDomain );

	const pendingDomain = nonWpcomDomains?.find(
		( wpcomDomain: ResponseDomain ) => wpcomDomain.pendingTransfer
	);

	if ( ! selectedSite?.ID || ! selectedSite?.slug ) {
		return null;
	}
	return (
		<Main>
			<FormattedHeader
				headerText={ translate( 'Site Transfer' ) }
				subHeaderText={ translate(
					'Transfer your site to another WordPress.com user. {{a}}Learn More.{{/a}}',
					{
						components: {
							a: <a target="blank" href={ localizeUrl( TRANSFER_SITE ) } />,
						},
					}
				) }
				align="left"
			/>
			<PageViewTracker
				path="/settings/start-site-transfer/:site"
				title={ translate( 'Settings > Start Site Transfer' ) }
			/>
			<HeaderCake backHref={ '/settings/general/' + selectedSite.slug } isCompact={ true }>
				<h1>{ translate( 'Site Transfer' ) }</h1>
			</HeaderCake>
			<ActionPanel>
				{ pendingDomain && <PendingDomainTransfer domain={ pendingDomain } /> }
				{ ! pendingDomain && <StartSiteOwnerTransfer /> }
			</ActionPanel>
		</Main>
	);
};

export default SiteOwnerTransfer;
