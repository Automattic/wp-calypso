import { getFeatureByKey } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getFallbackLossItems } from './get-confirmation-copy';
import type { Purchases } from '@automattic/data-stores';
import type { DisplayVariant } from 'calypso/lib/purchases/utils';

const CancelPurchaseFeatureList = ( {
	purchase,
	displayVariant,
	cancellationFeatures,
}: {
	purchase: Purchases.Purchase;
	displayVariant: DisplayVariant;
	cancellationFeatures: string[];
} ) => {
	const translate = useTranslate();

	// When no server-provided features list, fall back to a per-product-type
	// item so every confirmation screen shows at least one concrete thing the
	// user is giving up.
	const items: Array< { key: string; title: string } > = cancellationFeatures.length
		? cancellationFeatures.map( ( feature ) => ( {
				key: feature,
				title: getFeatureByKey( feature ).getTitle() as string,
		  } ) )
		: getFallbackLossItems( purchase ).map( ( title, idx ) => ( {
				key: `fallback-${ idx }`,
				title,
		  } ) );

	if ( ! items.length ) {
		return null;
	}

	const intro =
		displayVariant === 'remove'
			? translate( 'When you remove your subscription, you’ll lose access to:' )
			: translate( 'You’ll lose access to:' );

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
