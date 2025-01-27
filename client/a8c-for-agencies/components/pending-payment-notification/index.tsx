import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import useFetchInvoices from 'calypso/a8c-for-agencies/data/purchases/use-fetch-invoices';
import { CONTACT_URL_HASH_FRAGMENT } from '../a4a-contact-support-widget';
import { A4A_INVOICES_LINK } from '../sidebar-menu/lib/constants';

import './style.scss';

// TODO: Uncomment this if we would want to dismiss the notification.
// const PENDING_PAYMENT_NOTIFICATION_DISMISS_PREFERENCE = 'pending-payment-notification-dismissed';

export default function PendingPaymentNotification() {
	const invoices = useFetchInvoices( { starting_after: '', ending_before: '' }, undefined, 'open' );

	const translate = useTranslate();

	const daysDue = useMemo( () => {
		const oldestUnpaidInvoice =
			invoices?.data?.items.reduce( ( oldest, current ) => {
				return oldest < current.created ? oldest : current.created;
			}, Infinity ) || 0;
		const nowInSeconds = Math.floor( Date.now() / 1000 ); // Get current time in seconds
		const differenceInSeconds = nowInSeconds - oldestUnpaidInvoice;
		return Math.floor( differenceInSeconds / ( 60 * 60 * 24 ) ); // Convert seconds to days
	}, [ invoices ] );
	const daysLeft = 28 - daysDue;

	if ( ! invoices?.isSuccess || ! invoices?.data?.items?.length || daysDue < 7 ) {
		return null;
	}

	const title =
		daysDue < 21 ? translate( 'Overdue invoice' ) : translate( 'Urgent: Overdue invoice' );

	const level = daysDue < 21 ? 'warning' : 'error';

	let description;

	if ( daysDue < 14 ) {
		description = translate(
			'Your invoice is %(daysDue)d days overdue. Please pay as soon as possible to avoid service disruption.',
			{
				args: { daysDue },
				comment: '%(daysDue)d is the number of days invoice is overdue.',
			}
		);
	} else if ( daysDue < 21 ) {
		description = translate(
			'Your invoice is %(daysDue)d days overdue. You can’t issue new licenses until it’s paid.',
			{
				args: { daysDue },
				comment: '%(daysDue)d is the number of days invoice is overdue.',
			}
		);
	} else if ( daysDue < 27 ) {
		description = translate(
			'Your invoice is %(daysDue)d days overdue. We’ll revoke your active licenses if we don’t receive payment in %(daysLeft)d days.',
			{
				args: { daysDue, daysLeft },
				comment: '%(daysDue)d is the number of days invoice is overdue.',
			}
		);
	} else if ( daysDue < 28 ) {
		description = translate(
			'Your invoice is %(daysDue)d days overdue. We’ll revoke your active licenses tomorrow if we don’t receive payment.',
			{
				args: { daysDue },
				comment: '%(daysDue)d is the number of days invoice is overdue.',
			}
		);
	} else {
		description = translate(
			'Your product licenses have now been revoked. If you want to continue using the platform, please pay your outstanding invoices.'
		);
	}

	return (
		<LayoutBanner
			className="pending-payment-notification"
			level={ level }
			title={ title }
			hideCloseButton
		>
			<div>{ description }</div>
			<Button className="is-dark" href={ A4A_INVOICES_LINK }>
				{ translate( 'Pay invoice' ) }
			</Button>
			<Button variant="secondary" href={ CONTACT_URL_HASH_FRAGMENT }>
				{ translate( 'Contact support' ) }
			</Button>
		</LayoutBanner>
	);
}
