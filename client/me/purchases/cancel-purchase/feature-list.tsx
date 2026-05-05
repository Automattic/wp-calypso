import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import moment from 'moment';
import {
	getCancelLossIntro,
	getFallbackLossItems,
	getRemoveLossIntro,
	getSingleItemCancelCopy,
	getSingleItemRemoveCopy,
} from 'calypso/dashboard/me/billing-purchases/cancel-purchase/get-confirmation-copy';
import { getOverrideCancellationFeatures } from 'calypso/dashboard/me/billing-purchases/cancel-purchase/get-override-features';
import { toPurchaseForCopy } from './to-purchase-for-copy';
import type { CancellationFeature } from '@automattic/api-core';
import type { Purchases } from '@automattic/data-stores';
import type { PurchaseForCopy } from 'calypso/dashboard/me/billing-purchases/cancel-purchase/get-confirmation-copy';
import type { DisplayVariant } from 'calypso/lib/purchases/utils';

type LossItem = { key: string; title: string };

function getLossItems(
	overrideFeatures: CancellationFeature[] | null,
	cancellationFeatures: CancellationFeature[],
	adapted: PurchaseForCopy
): LossItem[] {
	if ( overrideFeatures ) {
		return overrideFeatures.map( ( feature ) => ( {
			key: String( feature.feature_id ),
			title: feature.title,
		} ) );
	}
	if ( cancellationFeatures.length ) {
		return cancellationFeatures.map( ( feature ) => ( {
			key: feature.feature_id,
			title: feature.title,
		} ) );
	}
	return getFallbackLossItems( adapted ).map( ( title, idx ) => ( {
		key: `fallback-${ idx }`,
		title,
	} ) );
}

const CancelPurchaseFeatureList = ( {
	purchase,
	displayVariant,
	cancellationFeatures,
}: {
	purchase: Purchases.Purchase;
	displayVariant: DisplayVariant;
	cancellationFeatures: CancellationFeature[];
} ) => {
	const adapted = toPurchaseForCopy( purchase );

	// When the split-cancel-remove flag is on, use client-side feature overrides
	// instead of the server-provided list. Falls back to API features when the
	const isSplitEnabled = useIsSplitCancelRemoveEnabled();
	const overrideFeatures = isSplitEnabled
		? getOverrideCancellationFeatures( adapted )
		: null;
		: null;

	const items = getLossItems( overrideFeatures, cancellationFeatures, adapted );

	if ( ! items.length ) {
		return null;
	}

	// Use non-breaking spaces in the formatted date so it never wraps mid-date.
	const fullExpiryDate = purchase.expiryDate
		? moment( purchase.expiryDate ).format( 'LL' ).replace( / /g, '\u00a0' )
		: '';

	if ( items.length === 1 ) {
		const singleItemCopy =
			displayVariant === 'remove'
				? getSingleItemRemoveCopy( adapted )
				: getSingleItemCancelCopy( adapted, fullExpiryDate );
		return (
			<div className="cancel-purchase__features">
				<p>{ singleItemCopy }</p>
			</div>
		);
	}

	const intro =
		displayVariant === 'remove'
			? getRemoveLossIntro( adapted )
			: getCancelLossIntro( adapted, fullExpiryDate );

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
