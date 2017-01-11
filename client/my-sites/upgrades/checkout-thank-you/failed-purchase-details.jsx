/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import PurchaseDetail from 'components/purchase-detail';
import support from 'lib/url/support';

const FailedPurchaseDetails = ( { failedPurchases, purchases, translate } ) => {
	const successfulPurchases = purchases.length > 0 && (
			<div>
				<hr />
				<p>
					{
						translate(
							'On the bright side, we managed to obtain these for you:'
						)
					}
				</p>
				<ul className="checkout-thank-you__failed-purchases-details-list">
					{ purchases.map( ( item, index ) => {
						return (
							<li key={ `purchases-${ index }-${ item.productId }` }>
								{ item.productName }{ item.meta && `: ${ item.meta }` }
							</li>
						);
					} ) }
				</ul>
			</div>
		),
		description = (
		<div>
			<p>
				{
					translate(
						'Here\'s the list of products we failed to obtain:'
					)
				}
			</p>
			<ul className="checkout-thank-you__failed-purchases-details-list">
				{ failedPurchases.map( ( item, index ) => {
					return (
						<li key={ `failed-purchase-${ index }-${ item.productId }` }>
							{ item.productName }{ item.meta && `: ${ item.meta }` }
						</li>
					);
				} ) }
			</ul>
			<p>
				{
					translate( 'We have filled your account with credits so you can retry the failed purchases. ' +
						'If the problem persists, please don\'t hesitate to {{a}}contact support{{/a}}!',
						{
							components: {
								a: <a href={ support.CALYPSO_CONTACT } target="_blank" rel="noopener noreferrer" />
							}
						}
					)
				}
			</p>
			{ successfulPurchases }
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
					isRequired />
			</div>
		</div>
	);
};

export default localize( FailedPurchaseDetails );
