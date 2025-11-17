import { Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { close, info } from '@wordpress/icons';
import { intlFormat } from 'date-fns';
import type { Purchase, CancellationFeature } from '@automattic/api-core';

type FeatureObject = {
	getSlug: () => string;
	getTitle: ( params?: { domainName?: string } ) => string;
};

const CancelPurchaseFeatureList = ( {
	purchase,
	cancellationFeatures,
	cancellationChanges,
}: {
	purchase: Purchase;
	cancellationFeatures: CancellationFeature[];
	cancellationChanges: FeatureObject[];
} ) => {
	if ( ! cancellationFeatures.length && ! cancellationChanges.length ) {
		return;
	}

	const { expiry_date: expiryDate } = purchase;
	const expirationDate = intlFormat( expiryDate, { dateStyle: 'medium' }, { locale: 'en-US' } );
	return (
		<>
			<div className="cancel-purchase__features">
				<p>
					{ sprintf(
						/* translators: %(expire)s is the date the product will expire */
						__( "Your plan will expire on %(expiry)s and you'll lose access to:" ),
						{
							expiry: expirationDate,
						}
					) }
				</p>
				<ul className="cancel-purchase__features-list">
					{ cancellationFeatures.map( ( feature ) => {
						if ( ! feature ) {
							return null;
						}
						return (
							<li key={ feature.feature_id }>
								<Icon
									className="cancel-purchase__refund-information--item-cross-small"
									size={ 24 }
									icon={ close }
								/>
								<span>{ feature.title }</span>
							</li>
						);
					} ) }
				</ul>
			</div>
			{ cancellationChanges.length > 0 && (
				<div className="cancel-purchase__changes">
					<p>{ __( 'We will also make these changes to your site:' ) }</p>
					<ul className="cancel-purchase__changes-list">
						{ cancellationChanges.map( ( change ) => {
							return (
								<li key={ change.getSlug() }>
									<Icon
										className="cancel-purchase__refund-information--item-notice-outline"
										size={ 24 }
										icon={ info }
									/>
									<span>{ change.getTitle() }</span>
								</li>
							);
						} ) }
					</ul>
				</div>
			) }
		</>
	);
};

export default CancelPurchaseFeatureList;
