import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PendingDomainTransfer from './pending-domain-transfer';
import SiteOwnerTransferEligibility from './site-owner-user-search';
import StartSiteOwnerTransfer from './start-site-owner-transfer';

const SiteOwnerTransferContainer = styled.div( {
	fontSize: '14px',
} );

const SiteOwnerTransfer = () => {
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );
	const [ newSiteOwner, setNewSiteOwner ] = useState( '' );

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
					'Transfer your site to another WordPress.com user. {{a}}Learn more.{{/a}}',
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
			<HeaderCake backHref={ '/settings/general/' + selectedSite.slug } isCompact={ true }>
				<h1>{ translate( 'Site Transfer' ) }</h1>
			</HeaderCake>
			<ActionPanel>
				<SiteOwnerTransferContainer>
					{ pendingDomain && <PendingDomainTransfer domain={ pendingDomain } /> }
					{ ! pendingDomain && ! newSiteOwner && (
						<SiteOwnerTransferEligibility
							siteId={ selectedSite.ID }
							siteSlug={ selectedSite.slug }
							siteOwner={ newSiteOwner }
							onNewUserOwnerSubmit={ ( newOwner ) => setNewSiteOwner( newOwner ) }
						/>
					) }
					{ ! pendingDomain && newSiteOwner && (
						<StartSiteOwnerTransfer siteOwner={ newSiteOwner } />
					) }
				</SiteOwnerTransferContainer>
			</ActionPanel>
		</Main>
	);
};

export default SiteOwnerTransfer;
