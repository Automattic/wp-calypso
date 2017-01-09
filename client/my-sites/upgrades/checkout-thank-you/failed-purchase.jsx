/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import PurchaseDetail from 'components/purchase-detail';
import support from 'lib/url/support';

const FailedPurchase = ( { failedPurchases, translate } ) => {
	const description = (
		<div>
			<p>
				{
					translate(
						'Here\'s the list of products we failed to obtain:'
					)
				}
			</p>
			<ul className="checkout-thank-you__domain-mapping-details-nameservers">
				{ failedPurchases.map( item => {
					return (
						<li key={ `failed-purchase-${ item.productId }-${ item.meta }` }>
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
		</div>
	);

	return (
		<div>
			<div className="checkout-thank-you__header">
				<div className="checkout-thank-you__header-content">
						<span className="checkout-thank-you__header-icon">
							<Gridicon icon="notice" size={ 72 } />
						</span>

					<div className="checkout-thank-you__header-copy">
						<h1 className="checkout-thank-you__header-heading">
							{ translate( 'Ooops…' ) }
						</h1>

						<h2 className="checkout-thank-you__header-text">
							{ translate( 'Seems we had some problems obtaining your items.' ) }
						</h2>
					</div>
				</div>
			</div>
			<div className="checkout-thank-you__purchase-details-list">
				<div className="checkout-thank-you__domain-mapping-details">
					<PurchaseDetail
						icon="redo"
						description={ description }
						target="_blank"
						rel="noopener noreferrer"
						isRequired />
				</div>
			</div>
		</div>
	);
};

export default localize( FailedPurchase );
