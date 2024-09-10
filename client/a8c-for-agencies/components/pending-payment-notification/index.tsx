import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { setPreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { CONTACT_URL_HASH_FRAGMENT } from '../a4a-contact-support-widget';
import { A4A_INVOICES_LINK } from '../sidebar-menu/lib/constants';

import './style.scss';

const PENDING_PAYMENT_NOTIFICATION_DISMISS_PREFERENCE = 'pending-payment-notification-dismissed';

export default function PendingPaymentNotification() {
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );

	const isDismissed = useSelector( ( state ) =>
		getPreference( state, PENDING_PAYMENT_NOTIFICATION_DISMISS_PREFERENCE )
	);

	const canIssueLicenses = agency?.can_issue_licenses;

	const translate = useTranslate();

	// If the agency can issue licenses or the notification has been dismissed, do not show the notification.
	if ( canIssueLicenses || isDismissed ) {
		return null;
	}

	return (
		<LayoutBanner
			className="pending-payment-notification"
			level="warning"
			title={ translate( 'Payment reminder' ) }
			onClose={ () =>
				// Dismiss the notification temporarily so that it shows again on the next page load.
				dispatch( setPreference( PENDING_PAYMENT_NOTIFICATION_DISMISS_PREFERENCE, true ) )
			}
		>
			<div>
				{ translate(
					'Your payment for the latest invoice is now overdue. To continue purchasing products and maintain uninterrupted services,{{br/}}please make your payment as soon as possible.',
					{
						components: {
							br: <br />,
						},
					}
				) }
			</div>
			<Button className="is-dark" href={ A4A_INVOICES_LINK }>
				{ translate( 'Pay invoice' ) }
			</Button>
			<Button variant="secondary" href={ CONTACT_URL_HASH_FRAGMENT }>
				{ translate( 'Contact support' ) }
			</Button>
		</LayoutBanner>
	);
}
