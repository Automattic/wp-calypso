import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { recordInboxNewMailboxUpsellClickEvent } from 'calypso/my-sites/email/email-management/home/utils';
import { INBOX_SOURCE } from 'calypso/my-sites/email/inbox/constants';
import { emailManagement, emailManagementEdit } from 'calypso/my-sites/email/paths';
import { getSelectedSite } from 'calypso/state/ui/selectors';

/**
 * Import styles
 */
import './style.scss';

const NewMailboxUpsell = ( { domains } ) => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteSlug = selectedSite?.slug;

	let upsellURL = '';
	if ( 1 === domains.length ) {
		// User has one single domain, determine subscribed email provider.
		if ( 'active' === domains[ 0 ]?.titanMailSubscription?.status ) {
			upsellURL = emailManagementEdit( selectedSiteSlug, domains[ 0 ]?.domain, 'titan/new', null, {
				source: INBOX_SOURCE,
			} );
		} else if ( 'active' === domains[ 0 ]?.googleAppsSubscription?.status ) {
			upsellURL = emailManagementEdit(
				selectedSiteSlug,
				domains[ 0 ]?.domain,
				'google-workspace/add-users',
				null,
				{ source: INBOX_SOURCE }
			);
		}
	}

	// Upsell URL not determined because user has multiple domains or none of the domains has email service subscription.
	if ( '' === upsellURL ) {
		upsellURL = emailManagement( selectedSiteSlug, null, null, { source: INBOX_SOURCE } );
	}

	const handleCreateNewMailboxClick = useCallback( () => {
		recordInboxNewMailboxUpsellClickEvent();
		page( upsellURL );
	}, [ selectedSiteSlug ] );

	return (
		<div className="new-mailbox-upsell__container">
			<div className="new-mailbox-upsell">
				<div className="new-mailbox-upsell__messages">
					<h2>{ translate( 'Need another mailbox?' ) }</h2>
					<div>{ translate( 'Create new and activate immediately' ) }</div>
				</div>
				<div className="new-mailbox-upsell__cta">
					<Button onClick={ handleCreateNewMailboxClick }>
						{ translate( 'Create a new mailbox' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default NewMailboxUpsell;
