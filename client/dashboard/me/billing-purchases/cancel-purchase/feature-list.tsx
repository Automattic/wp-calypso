import config from '@automattic/calypso-config';
import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, info } from '@wordpress/icons';
import { intlFormat } from 'date-fns';
import { Text } from '../../../components/text';
import { DisplayVariant } from '../../../utils/purchase';
import {
	getCancelLossIntro,
	getFallbackLossItems,
	getRemoveLossIntro,
	getSingleItemCancelCopy,
	getSingleItemRemoveCopy,
} from './get-confirmation-copy';
import { getOverrideCancellationFeatures } from './get-override-features';
import type { Purchase, CancellationFeature } from '@automattic/api-core';

type FeatureObject = {
	getSlug: () => string;
	getTitle: ( params?: { domainName?: string } ) => string;
};

type LossItem = { key: string; title: string };

function getLossItems(
	overrideFeatures: CancellationFeature[] | null,
	cancellationFeatures: CancellationFeature[],
	purchase: Purchase
): LossItem[] {
	if ( overrideFeatures ) {
		return overrideFeatures.map( ( feature ) => ( {
			key: String( feature.feature_id ),
			title: feature.title,
		} ) );
	}
	if ( cancellationFeatures.length ) {
		return cancellationFeatures
			.filter( ( feature ): feature is CancellationFeature => Boolean( feature ) )
			.map( ( feature ) => ( {
				key: String( feature.feature_id ),
				title: feature.title,
			} ) );
	}
	return getFallbackLossItems( purchase ).map( ( title, idx ) => ( {
		key: `fallback-${ idx }`,
		title,
	} ) );
}

const CancelPurchaseFeatureList = ( {
	purchase,
	displayVariant,
	cancellationFeatures,
	cancellationChanges,
}: {
	purchase: Purchase;
	displayVariant: DisplayVariant;
	cancellationFeatures: CancellationFeature[];
	cancellationChanges: FeatureObject[];
} ) => {
	// When the split-cancel-remove flag is on, use client-side feature overrides
	// instead of the server-provided list. Falls back to API features when the
	// override returns null (no entries yet for this product category).
	const isSplitEnabled = useIsSplitCancelRemoveEnabled();
	const overrideFeatures = isSplitEnabled
		? getOverrideCancellationFeatures( purchase )
		: null;

	const lossItems = getLossItems( overrideFeatures, cancellationFeatures, purchase );

	if ( ! lossItems.length && ! cancellationChanges.length ) {
		return null;
	}

	// Full date ("April 16, 2027") — not abbreviated — in the intro so the user
	// sees the exact expiry before the losses list. Only for Cancel variant;
	// Remove happens immediately, no future date to surface.
	// Use non-breaking spaces in the formatted date so it never wraps mid-date
	// (e.g. "April\n16, 2027").
	const fullExpiryDate = purchase.expiry_date
		? intlFormat( purchase.expiry_date, { dateStyle: 'long' }, { locale: 'en-US' } ).replace(
				/ /g,
				'\u00a0'
		  )
		: '';
	const introCopy =
		displayVariant === 'remove'
			? getRemoveLossIntro( purchase )
			: getCancelLossIntro( purchase, fullExpiryDate );

	return (
		<VStack spacing={ 6 }>
			{ lossItems.length === 1 ? (
				<Text as="p">
					{ displayVariant === 'remove'
						? getSingleItemRemoveCopy( purchase )
						: getSingleItemCancelCopy( purchase, fullExpiryDate ) }
				</Text>
			) : (
				lossItems.length > 0 && (
					<VStack spacing={ 2 }>
						<Text as="p">{ introCopy }</Text>
						<VStack as="ul" spacing={ 1 } style={ { listStyle: 'none', padding: 0, margin: 0 } }>
							{ lossItems.map( ( item ) => (
								<li key={ item.key }>
									<HStack alignment="topLeft">
										<Icon
											size={ 20 }
											icon={ close }
											style={ {
												flexShrink: 0,
												fill: 'var( --dashboard__foreground-color-error )',
											} }
										/>
										<span>{ item.title }</span>
									</HStack>
								</li>
							) ) }
						</VStack>
					</VStack>
				)
			) }
			{ cancellationChanges.length > 0 && (
				<VStack spacing={ 2 }>
					<Text as="p">{ __( 'We will also make these changes to your site:' ) }</Text>
					<VStack as="ul" spacing={ 1 } style={ { listStyle: 'none', padding: 0, margin: 0 } }>
						{ cancellationChanges.map( ( change ) => (
							<li key={ change.getSlug() }>
								<HStack alignment="topLeft">
									<Icon
										size={ 20 }
										icon={ info }
										style={ {
											flexShrink: 0,
											fill: 'var( --dashboard__foreground-color-warning )',
										} }
									/>
									<span>{ change.getTitle() }</span>
								</HStack>
							</li>
						) ) }
					</VStack>
				</VStack>
			) }
		</VStack>
	);
};

export default CancelPurchaseFeatureList;
