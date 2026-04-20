import { getFeatureByKey } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getName } from 'calypso/lib/purchases';
import type { Purchases } from '@automattic/data-stores';

const CancelPurchaseFeatureList = ( {
	purchase,
	cancellationFeatures,
	useRefundableWpcomCopy = false,
}: {
	purchase: Purchases.Purchase;
	cancellationFeatures: string[];
	useRefundableWpcomCopy?: boolean;
} ) => {
	const translate = useTranslate();

	if ( ! cancellationFeatures.length ) {
		return;
	}

	return (
		<div className="cancel-purchase__features">
			<p>
				{ ! useRefundableWpcomCopy
					? translate(
							'By canceling the %(productName)s plan, these features will no longer be available on your site:',
							{
								args: {
									productName: getName( purchase ),
								},
							}
					  )
					: translate(
							'These features will no longer be available on your site when your %(productName)s plan expires:',
							{
								args: {
									productName: getName( purchase ),
								},
							}
					  ) }
			</p>
			<ul className="cancel-purchase__features-list">
				{ cancellationFeatures.map( ( feature ) => {
					return (
						<li key={ feature }>
							<Gridicon
								className="cancel-purchase__refund-information--item-cross-small"
								size={ 24 }
								icon="cross-small"
							/>
							<span>{ getFeatureByKey( feature ).getTitle() }</span>
						</li>
					);
				} ) }
			</ul>
		</div>
	);
};

export default CancelPurchaseFeatureList;
