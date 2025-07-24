import { Badge } from '@automattic/components';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { Payment } from 'calypso/data/promote-post/use-promote-post-payments-query';
import {
	formatCents,
	getPaymentStatus,
	getPaymentStatusBadgeColor,
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
				payment.subtotal || 0,
				2
			) }` }</td>
			<td className="payment-item__credits">{ `$${ formatCents(
				payment.credits_used || 0,
				2
			) }` }</td>
			<td className="payment-item__total">{ `$${ formatCents( payment.total || 0, 2 ) }` }</td>
			<td className="payment-item__actions">
				<Button
					isBusy={ false }
					disabled={ false }
					onClick={ getReceipt }
					className="campaign-item__post-details-button"
				>
					<span aria-hidden="true">{ __( 'View receipt' ) }</span>
					<span className="sr-only">
						{ translate( 'View receipt for payment %(name)s', {
							args: { name: payment.id },
						} ) }
					</span>
				</Button>
			</td>
		</tr>
	);
}
