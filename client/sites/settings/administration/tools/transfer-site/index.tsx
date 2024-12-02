import page from '@automattic/calypso-router';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useQueryUserPurchases } from 'calypso/components/data/query-user-purchases';
import { PanelCardHeading } from 'calypso/components/panel';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { getSettingsSource } from 'calypso/my-sites/site-settings/site-tools/utils';
import { isHostingMenuUntangled } from 'calypso/sites/settings/utils';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { ConfirmationTransfer } from './confirmation-transfer';
import PendingDomainTransfer from './pending-domain-transfer';
import SiteOwnerTransferEligibility from './site-owner-user-search';
import { SiteTransferCard } from './site-transfer-card';
import StartSiteOwnerTransfer from './start-site-owner-transfer';
import { useConfirmationTransferHash } from './use-confirmation-transfer-hash';

const Strong = styled( 'strong' )( {
	fontWeight: 500,
} );

const SiteTransferComplete = () => {
	const translate = useTranslate();
	const userEmail = useSelector( getCurrentUserEmail );
	if ( ! userEmail ) {
		return null;
	}

	const isUntangled = isHostingMenuUntangled();
	const message = (
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
	return (
		<>
			{ isUntangled && (
				<PanelCardHeading>{ translate( 'Confirmation email sent' ) }</PanelCardHeading>
			) }
			{ message }
		</>
	);
};

const SiteOwnerTransfer = () => {
	useQueryUserPurchases();
	const selectedSite = useSelector( getSelectedSite );
	const [ newSiteOwner, setNewSiteOwner ] = useState< string | null >( null );
	const [ transferSiteSuccess, setSiteTransferSuccess ] = useState( false );

	const translate = useTranslate();
	const dispatch = useDispatch();
	const nonWpcomDomains = useSelector( ( state ) =>
		getDomainsBySiteId( state, selectedSite?.ID )
	)?.filter( ( domain ) => ! domain.isWPCOMDomain );
	const confirmationHash = useConfirmationTransferHash();

	const pendingDomain = nonWpcomDomains?.find(
		( wpcomDomain: ResponseDomain ) => wpcomDomain.pendingTransfer
	);

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_site_owner_transfer_page_view' ) );
	}, [ dispatch ] );

	if ( ! selectedSite?.ID || ! selectedSite?.slug ) {
		return null;
	}

	const onBackClick = () => {
		if ( ! pendingDomain && newSiteOwner && ! transferSiteSuccess ) {
			setNewSiteOwner( null );
		} else {
			const source = isHostingMenuUntangled()
				? '/sites/settings/administration'
				: getSettingsSource();
			page( `${ source }/${ selectedSite.slug }` );
		}
	};

	if ( confirmationHash ) {
		return (
			<SiteTransferCard onClick={ onBackClick }>
				<ConfirmationTransfer siteId={ selectedSite.ID } confirmationHash={ confirmationHash } />
			</SiteTransferCard>
		);
	}

	return (
		<SiteTransferCard onClick={ onBackClick }>
			{ pendingDomain && <PendingDomainTransfer domain={ pendingDomain } /> }
			{ ! pendingDomain && ! newSiteOwner && (
				<SiteOwnerTransferEligibility
					siteId={ selectedSite.ID }
					siteSlug={ selectedSite.slug }
					onNewUserOwnerSubmit={ ( newOwner ) => setNewSiteOwner( newOwner ) }
				/>
			) }
			{ ! pendingDomain && newSiteOwner && ! transferSiteSuccess && (
				<StartSiteOwnerTransfer
					onSiteTransferSuccess={ () => {
						setSiteTransferSuccess( true );
						dispatch( successNotice( translate( 'Email sent successfully' ), { duration: 8000 } ) );
					} }
					onSiteTransferError={ () => {
						setSiteTransferSuccess( false );
					} }
					customDomains={ nonWpcomDomains }
					siteOwner={ newSiteOwner }
				/>
			) }
			{ ! pendingDomain && newSiteOwner && transferSiteSuccess && <SiteTransferComplete /> }
		</SiteTransferCard>
	);
};

export default SiteOwnerTransfer;
