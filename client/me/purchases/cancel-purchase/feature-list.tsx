import { Gridicon } from '@automattic/components';
import moment from 'moment';
import {
	getCancelLossIntro,
	getFallbackLossItems,
	getRemoveLossIntro,
} from './get-confirmation-copy';
import type { CancellationFeature } from '@automattic/api-core';
import type { Purchases } from '@automattic/data-stores';
import type { DisplayVariant } from 'calypso/lib/purchases/utils';

const CancelPurchaseFeatureList = ( {
	purchase,
	displayVariant,
	cancellationFeatures,
}: {
	purchase: Purchases.Purchase;
	displayVariant: DisplayVariant;
	cancellationFeatures: CancellationFeature[];
} ) => {
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
	const fullExpiryDate = purchase.expiryDate
		? moment( purchase.expiryDate ).format( 'LL' ).replace( / /g, '\u00a0' )
		: '';
	const intro =
		displayVariant === 'remove'
			? getRemoveLossIntro( purchase )
			: getCancelLossIntro( purchase, fullExpiryDate );

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
