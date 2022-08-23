import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs, isUserOnTitanFreeTrial } from 'calypso/lib/titan';
import { INBOX_SOURCE } from 'calypso/my-sites/email/inbox/constants';
import { emailManagement, emailManagementEdit } from 'calypso/my-sites/email/paths';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Import styles
 */
import './style.scss';

const NewMailboxUpsell = ( { domains }: { domains: ResponseDomain[] } ) => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteSlug = selectedSite?.slug;

	// By default, upsell CTA links to the email management landing page.
	let upsellURL = emailManagement( selectedSiteSlug, null, null, { source: INBOX_SOURCE } );

	let isFreeTrialNow = false;

	// User has one single domain, determine / email addition page URL based on subscribed email provider.
	if ( domains.length === 1 ) {
		const domainItem = domains[ 0 ];

		let slug = '';
		if ( hasTitanMailWithUs( domainItem ) ) {
			slug = 'titan/new';

			isFreeTrialNow = isUserOnTitanFreeTrial( domainItem );
		} else if ( hasGSuiteWithUs( domainItem ) ) {
			slug = 'google-workspace/add-users';
		}

		if ( slug ) {
			upsellURL = emailManagementEdit( selectedSiteSlug, domainItem.domain, slug, null, {
				source: INBOX_SOURCE,
			} );
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
					<Button
						onClick={ () =>
							recordTracksEvent( 'calypso_inbox_new_mailbox_upsell_click', {
								context: isFreeTrialNow ? 'free' : 'paid',
							} )
						}
						href={ upsellURL }
					>
						{ translate( 'Create a new mailbox' ) }
					</Button>
				</div>
			</div>
		</div>
	);
};

export default NewMailboxUpsell;
