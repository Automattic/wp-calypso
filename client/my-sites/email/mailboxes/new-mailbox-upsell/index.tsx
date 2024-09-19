import { Button, Ribbon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { canAddMailboxesToEmailSubscription } from 'calypso/lib/emails';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs, isUserOnTitanFreeTrial } from 'calypso/lib/titan';
import { MAILBOXES_SOURCE } from 'calypso/my-sites/email/mailboxes/constants';
import {
	getEmailManagementPath,
	getAddGSuiteUsersPath,
	getNewTitanAccountPath,
} from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
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

	const canAddMailboxes = domains.some( canAddMailboxesToEmailSubscription );
	if ( ! canAddMailboxes ) {
		return null;
	}

	// By default, upsell CTA links to the email management landing page.
	let upsellURL = getEmailManagementPath( selectedSiteSlug, null, null, {
		source: MAILBOXES_SOURCE,
	} );

	let isFreeTrialNow = false;
	let provider = '';

	// User has one single domain, determine / email addition page URL based on subscribed email provider.
	if ( domains.length === 1 ) {
		const domainItem = domains[ 0 ];

		if ( hasTitanMailWithUs( domainItem ) ) {
			provider = 'titan';
			isFreeTrialNow = isUserOnTitanFreeTrial( domainItem );
			upsellURL = getNewTitanAccountPath( selectedSiteSlug, domainItem.domain, null, {
				source: MAILBOXES_SOURCE,
			} );
		} else if ( hasGSuiteWithUs( domainItem ) ) {
			provider = 'google';
			upsellURL = getAddGSuiteUsersPath( selectedSiteSlug, domainItem.domain, 'google-workspace' );
		}
	}

	return (
		<div className="new-mailbox-upsell__container">
			<div className="new-mailbox-upsell">
				{ isFreeTrialNow && <Ribbon color="green">FREE</Ribbon> }
				<div className="new-mailbox-upsell__messages">
					<h2>{ translate( 'Need another mailbox?' ) }</h2>
					<div>
						{ isFreeTrialNow
							? translate(
									'Create a new one for free during your trial to experience multiple mailbox efficiency.'
							  )
							: translate( 'Create a new one now to experience multiple mailbox efficiency.' ) }
					</div>
				</div>
				<div className="new-mailbox-upsell__cta">
					<Button
						onClick={ () =>
							recordTracksEvent( 'calypso_inbox_new_mailbox_upsell_click', {
								context: isFreeTrialNow ? 'free' : 'paid',
								provider,
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
