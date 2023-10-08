import { useI18n } from '@wordpress/react-i18n';
import { LineItem } from './helpers';
import {
	OrderReviewLineItems,
	OrderReviewTotal,
	OrderReviewSection,
} from './order-review-line-items';

export default function CheckoutReviewOrder( { items }: { items: LineItem[] } ) {
	const total = items.reduce( ( sum, item ) => sum + item.amount, 0 );

	return (
		<div className="checkout-review-order">
			<OrderReviewSection>
				<OrderReviewLineItems items={ items } />
			</OrderReviewSection>
			<OrderReviewSection>
				<OrderReviewTotal total={ { id: 'total', type: 'total', label: 'Total', amount: total } } />
			</OrderReviewSection>
		</div>
	);
}

export function CheckoutReviewOrderTitle() {
	const { __ } = useI18n();
	return <>{ __( 'Review your order' ) }</>;
}
