import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import StartSiteOwnerTransfer from './start-site-owner-transfer';

const SiteOwnerTransfer = () => {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const selectedSiteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );

	const translate = useTranslate();
	if ( ! selectedSiteId || ! selectedSiteSlug ) {
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
							a: <InlineSupportLink supportContext="site-transfer" showIcon={ false } />,
						},
					}
				) }
				align="left"
			/>
			<PageViewTracker
				path="/settings/start-site-transfer/:site"
				title="Settings > Start Site Transfer"
			/>
			<HeaderCake backHref={ '/settings/general/' + selectedSiteSlug } isCompact={ true }>
				<h1>{ translate( 'Site Transfer' ) }</h1>
			</HeaderCake>
			<ActionPanel>
				<StartSiteOwnerTransfer />
			</ActionPanel>
		</Main>
	);
};

export default SiteOwnerTransfer;
