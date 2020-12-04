/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import PurchaseDetail from 'calypso/components/purchase-detail';
import { CALYPSO_CONTACT } from 'calypso/lib/url/support';

const FailedPurchaseDetails = ( { failedPurchases, purchases, translate } ) => {
	const successfulPurchases = purchases.length > 0 && (
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
	const description = (
		<div>
			{ successfulPurchases }
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
			<p>
				{ translate(
					'We added credits to your account, so you can try adding these items again. ' +
						"If the problem persists, please don't hesitate to {{a}}contact support{{/a}}.",
					{
						components: {
							a: <a href={ CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />,
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
};

export default localize( FailedPurchaseDetails );
