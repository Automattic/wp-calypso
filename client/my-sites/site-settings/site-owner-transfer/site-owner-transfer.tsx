import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import ActionPanel from 'calypso/components/action-panel';
import { useQueryUserPurchases } from 'calypso/components/data/query-user-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import PendingDomainTransfer from './pending-domain-transfer';
import SiteOwnerTransferEligibility from './site-owner-user-search';
import StartSiteOwnerTransfer from './start-site-owner-transfer';

const Strong = styled( 'strong' )( {
	fontWeight: 500,
} );

const SiteTransferComplete = () => {
	const translate = useTranslate();
	const userEmail = useSelector( getCurrentUserEmail );
	if ( ! userEmail ) {
		return null;
	}

	return (
		<p>
			{ translate(
				/* translators: %email is the email of the user who is going to be the new owner of the site */
				'You have been sent a transfer confirmation email to {{strong}}%(email)s{{/strong}}. Please check your inbox and spam folder. The transfer will not proceed unless you authorize it using the link in the email.',
				{
					args: { email: userEmail },
					components: { strong: <Strong /> },
				}
			) }
		</p>
	);
};

const ActionPanelStyled = styled( ActionPanel )`
	font-size: 14px;
	font-weight: 400;
	.action-panel__body {
		color: var( --studio-gray-70 );
	}
`;

const SiteOwnerTransfer = () => {
	useQueryUserPurchases();
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );
	const [ newSiteOwner, setNewSiteOwner ] = useState( '' );
	const [ transferSiteSuccess, setSiteTransferSuccess ] = useState( false );

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
			<ActionPanelStyled>
				{ pendingDomain && <PendingDomainTransfer domain={ pendingDomain } /> }
				{ ! pendingDomain && ! newSiteOwner && (
					<SiteOwnerTransferEligibility
						siteId={ selectedSite.ID }
						siteSlug={ selectedSite.slug }
						siteOwner={ newSiteOwner }
						onNewUserOwnerSubmit={ ( newOwner ) => setNewSiteOwner( newOwner ) }
					/>
				) }
				{ ! pendingDomain && newSiteOwner && ! transferSiteSuccess && (
					<StartSiteOwnerTransfer
						onSiteTransferSuccess={ () => {
							setSiteTransferSuccess( true );
						} }
						onSiteTransferError={ () => {
							setSiteTransferSuccess( false );
						} }
						customDomains={ nonWpcomDomains }
						siteOwner={ newSiteOwner }
					/>
				) }
				{ ! pendingDomain && newSiteOwner && transferSiteSuccess && <SiteTransferComplete /> }
			</ActionPanelStyled>
		</Main>
	);
};

export default SiteOwnerTransfer;
