import page from '@automattic/calypso-router';
import { Badge, ExternalLink } from '@automattic/components';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { Payment } from 'calypso/data/promote-post/use-promote-post-payments-query';
import {
	formatCents,
	getAdvertisingDashboardPath,
	getPaymentStatus,
	getPaymentStatusBadgeColor,
	paymentStatus,
} from 'calypso/my-sites/promote-post-i2/utils';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

interface Props {
	payment: Payment;
}

export default function PaymentItem( props: Props ) {
	const { payment } = props;
	const siteSlug = useSelector( getSelectedSiteSlug );

	const getReceipt = () => {
		const path = `/payments/receipt/${ payment.id }/${ siteSlug }`;
		page( getAdvertisingDashboardPath( path ) );
	};

	const getActionButton = ( status: Payment[ 'status' ] ) => {
		let actionButton;

		switch ( status ) {
			case paymentStatus.FAILED:
			case paymentStatus.PENDING:
				actionButton = (
					<div className="payment-item__pay-action">
						<ExternalLink href={ payment.payment_link } target="_blank">
							{ translate( 'Pay' ) }
							<span className="sr-only">
								{
									// Translators: This is a payment button. "Pay" is the call-to-action button
									// text and the param %(name) is the payment ID.
									translate( 'Pay for %(name)s', {
										args: { name: payment.id },
									} )
								}
							</span>
						</ExternalLink>
					</div>
				);
				break;

			case paymentStatus.CANCELED:
				actionButton = null;
				break;

			default:
				actionButton = (
					<Button
						isBusy={ false }
						disabled={ false }
						onClick={ getReceipt }
						className="payment-item__view-receipt-action"
					>
						<span aria-hidden="true">{ __( 'Receipt' ) }</span>
						<span className="sr-only">
							{
								// Translators: Text for a button with action to view the receipt.
								// "%(name)s" is the payment ID
								translate( 'View receipt for payment %(name)s', {
									args: { name: payment.id },
								} )
							}
						</span>
					</Button>
				);
		}
		return actionButton;
	};

	return (
		<tr>
			<td className="payment-item__payment-id">{ payment.id }</td>
			<td className="payment-item__status">
				<Badge type={ getPaymentStatusBadgeColor( payment.status ) }>
					{ getPaymentStatus( payment.status ) }
				</Badge>
			</td>
			<td className="payment-item__date">
				{ moment.utc( payment.date ).format( 'MMMM DD, YYYY' ) }
			</td>
			<td className="payment-item__subtotal">{ `$${ formatCents(
				payment.total_with_credits || 0,
				2
			) }` }</td>
			<td className="payment-item__credits">{ `$${ formatCents(
				payment.credits_used || 0,
				2
			) }` }</td>
			<td className="payment-item__total">{ `$${ formatCents( payment.total_paid || 0, 2 ) }` }</td>
			<td className="payment-item__actions">{ getActionButton( payment.status ) }</td>
		</tr>
	);
}
