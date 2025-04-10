import { CALYPSO_CONTACT } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import PurchaseDetail from 'calypso/components/purchase-detail';
import type { FailedReceiptPurchase, ReceiptPurchase } from 'calypso/state/receipts/types';

export default function FailedPurchaseDetails( {
	failedPurchases,
	purchases,
}: {
	purchases?: ReceiptPurchase[];
	failedPurchases?: FailedReceiptPurchase[];
} ) {
	const translate = useTranslate();
	const successfulPurchasesForDisplay = purchases && purchases.length > 0 && (
		<div>
			<p>{ translate( 'These items were added successfully:' ) }</p>
			<ul className="checkout-thank-you__failed-purchases-details-list">
				{ purchases.map( ( item, index ) => {
					return (
						<li key={ `purchases-${ index }-${ item.productId }` }>
							{ item.productName }
							{ item.meta && `: ${ item.meta }` }
						</li>
					);
				} ) }
			</ul>
			<hr />
		</div>
	);
	const failedPurchasesForDisplay = failedPurchases ? (
		<>
			<p>{ translate( 'These items could not be added:' ) }</p>
			<ul className="checkout-thank-you__failed-purchases-details-list">
				{ failedPurchases.map( ( item, index ) => {
					return (
						<li key={ `failed-purchase-${ index }-${ item.productId }` }>
							{ item.productName }
							{ item.meta && `: ${ item.meta }` }
						</li>
					);
				} ) }
			</ul>
		</>
	) : (
		<p>{ translate( 'Some items failed to be purchased.' ) }</p>
	);
	const description = (
		<div>
			{ successfulPurchasesForDisplay }
			{ failedPurchasesForDisplay }
			<p>
				{ translate(
					'We refunded the failed purchases so you can try adding these items again. ' +
						"If the problem persists, please don't hesitate to {{a}}contact support{{/a}}.",
					{
						components: {
							a: <a href={ CALYPSO_CONTACT } />,
						},
					}
				) }
			</p>
		</div>
	);

	return (
		<div className="checkout-thank-you__purchase-details-list">
			<div className="checkout-thank-you__failed-purchases-details">
				<PurchaseDetail
					icon="redo"
					description={ description }
					target="_blank"
					rel="noopener noreferrer"
					isRequired
				/>
			</div>
		</div>
	);
}
