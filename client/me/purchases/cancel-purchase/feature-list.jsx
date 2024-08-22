import { getFeatureByKey } from '@automattic/calypso-products'; // eslint-disable-line import/named
import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getName } from 'calypso/lib/purchases';

const CancelPurchaseFeatureList = ( { purchase, cancellationFeatures } ) => {
	const translate = useTranslate();

	if ( ! cancellationFeatures.length ) {
		return;
	}

	return (
		<div className="cancel-purchase__features">
			<p>
				{ translate(
					'By canceling the %(productName)s plan, these features will no longer be available on your site:',
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
			<p className="cancel-purchase__features-link">
				<a href={ '/plans/my-plan/' + purchase?.domain }>
					{ translate( 'View all features', {
						args: {
							productName: getName( purchase ),
						},
					} ) }
				</a>
			</p>
		</div>
	);
};

export default CancelPurchaseFeatureList;
