import { Badge, ExternalLink } from '@automattic/components';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { Payment } from 'calypso/data/promote-post/use-promote-post-payments-query';
import {
	formatCents,
	getPaymentStatus,
	getPaymentStatusBadgeColor,
	paymentStatus,
} from 'calypso/my-sites/promote-post-i2/utils';

interface Props {
	payment: Payment;
}
export default function PaymentItem( props: Props ) {
	const { payment } = props;

	const getReceipt = () => {
		// todo get payment/order details functionality
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
			<td className="payment-item__actions">
				{ payment.status === paymentStatus.FAILED || payment.status === paymentStatus.PENDING ? (
					<div className="payment-item__pay-action">
						<ExternalLink href={ payment.payment_link } target="_blank">
							{ translate( 'Pay' ) }
							<span className="sr-only">
								{ translate( 'Pay for %(name)s', {
									args: { name: payment.id },
								} ) }
							</span>
						</ExternalLink>
					</div>
				) : (
					<Button
						isBusy={ false }
						disabled={ false }
						onClick={ getReceipt }
						className="payment-item__view-receipt-action"
					>
						<span aria-hidden="true">{ __( 'Receipt' ) }</span>
						<span className="sr-only">
							{ translate( 'View receipt for payment %(name)s', {
								args: { name: payment.id },
							} ) }
						</span>
					</Button>
				) }
			</td>
		</tr>
	);
}
