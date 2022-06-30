import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
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

	let upsellURL = emailManagement( selectedSiteSlug, null, null, { source: INBOX_SOURCE } );

	// User has one single domain, determine subscribed email provider.
	if ( domains.length === 1 ) {
		if ( hasTitanMailWithUs( domains[ 0 ] ) ) {
			upsellURL = emailManagementEdit( selectedSiteSlug, domains[ 0 ].domain, 'titan/new', null, {
				source: INBOX_SOURCE,
			} );
		} else if ( hasGSuiteWithUs( domains[ 0 ] ) ) {
			upsellURL = emailManagementEdit(
				selectedSiteSlug,
				domains[ 0 ].domain,
				'google-workspace/add-users',
				null,
				{ source: INBOX_SOURCE }
			);
		}
	}

	return (
		<div className="new-mailbox-upsell__container">
			<div className="new-mailbox-upsell">
				<div className="new-mailbox-upsell__messages">
					<h2>{ translate( 'Need another mailbox?' ) }</h2>
					<div>{ translate( 'Create a new one and activate it immediately.' ) }</div>
				</div>
				<div className="new-mailbox-upsell__cta">
					<Button onClick={ recordInboxNewMailboxUpsellClickEvent } href={ upsellURL }>
						{ translate( 'Create a new mailbox' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default NewMailboxUpsell;
