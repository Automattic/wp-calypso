import { Gridicon } from '@automattic/components';
import moment from 'moment';
import {
	getCancelLossIntro,
	getFallbackLossItems,
	getRemoveLossIntro,
	getSingleItemCancelCopy,
	getSingleItemRemoveCopy,
} from 'calypso/dashboard/me/billing-purchases/cancel-purchase/get-confirmation-copy';
import { isExpiredAndInGracePeriod } from 'calypso/dashboard/utils/purchase';
import type { CancellationFeature, Purchase } from '@automattic/api-core';
import type { DisplayVariant } from 'calypso/dashboard/utils/purchase';

const CancelPurchaseFeatureList = ( {
	purchase,
	displayVariant,
	cancellationFeatures,
}: {
	purchase: Purchase;
	displayVariant: DisplayVariant;
	cancellationFeatures: CancellationFeature[];
} ) => {
	const inGracePeriod = isExpiredAndInGracePeriod( purchase );
	// When the server returns no features, fall back to a per-product-type item.
	const items: Array< { key: string; title: string } > = cancellationFeatures.length
		? cancellationFeatures.map( ( feature ) => ( {
				key: feature.feature_id,
				title: feature.title,
		  } ) )
		: getFallbackLossItems( purchase ).map( ( title, idx ) => ( {
				key: `fallback-${ idx }`,
				title,
		  } ) );

	if ( ! items.length ) {
		return null;
	}

	// Use non-breaking spaces in the formatted date so it never wraps mid-date.
	const fullExpiryDate = purchase.expiry_date
		? moment( purchase.expiry_date ).format( 'LL' ).replace( / /g, '\u00a0' )
		: '';

	if ( items.length === 1 ) {
		const singleItemCopy =
			displayVariant === 'remove'
				? getSingleItemRemoveCopy( purchase )
				: getSingleItemCancelCopy( purchase, fullExpiryDate, inGracePeriod );
		return (
			<div className="cancel-purchase__features">
				<p>{ singleItemCopy }</p>
			</div>
		);
	}

	const intro =
		displayVariant === 'remove'
			? getRemoveLossIntro( purchase )
			: getCancelLossIntro( purchase, fullExpiryDate, inGracePeriod );

	return (
		<div className="cancel-purchase__features">
			<p>{ intro }</p>
			<ul className="cancel-purchase__features-list">
				{ items.map( ( item ) => (
					<li key={ item.key }>
						<Gridicon
							className="cancel-purchase__refund-information--item-cross-small"
							size={ 24 }
							icon="cross-small"
						/>
						<span>{ item.title }</span>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default CancelPurchaseFeatureList;
