import {
	Icon,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, info } from '@wordpress/icons';
import { intlFormat } from 'date-fns';
import { Text } from '../../../components/text';
import { DisplayVariant, isExpiredAndInGracePeriod } from '../../../utils/purchase';
import {
	getCancelLossIntro,
	getFallbackLossItems,
	getRemoveLossIntro,
	getSingleItemCancelCopy,
	getSingleItemRemoveCopy,
	getTitanCancellationLossItems,
} from './get-confirmation-copy';
import type { Purchase, CancellationFeature } from '@automattic/api-core';

type FeatureObject = {
	getSlug: () => string;
	getTitle: ( params?: { domainName?: string } ) => string;
};

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
	// Titan's server-provided feature list is tier-unaware, so for Titan
	// purchases we derive the loss list from the tier the user is on. Everything
	// else uses the server list, falling back to a per-product-type item so every
	// confirmation screen shows at least one concrete thing the user is giving up.
	const titanLossItems = getTitanCancellationLossItems( purchase );
	let lossItems: Array< { key: string; title: string } >;
	if ( titanLossItems ) {
		lossItems = titanLossItems.map( ( title, idx ) => ( { key: `titan-${ idx }`, title } ) );
	} else if ( cancellationFeatures.length ) {
		lossItems = cancellationFeatures
			.filter( ( feature ): feature is CancellationFeature => Boolean( feature ) )
			.map( ( feature ) => ( { key: String( feature.feature_id ), title: feature.title } ) );
	} else {
		lossItems = getFallbackLossItems( purchase ).map( ( title, idx ) => ( {
			key: `fallback-${ idx }`,
			title,
		} ) );
	}

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
	const inGracePeriod = isExpiredAndInGracePeriod( purchase );
	const introCopy =
		displayVariant === 'remove'
			? getRemoveLossIntro( purchase )
			: getCancelLossIntro( purchase, fullExpiryDate, inGracePeriod );

	return (
		<VStack spacing={ 6 }>
			{ lossItems.length === 1 ? (
				<Text as="p">
					{ displayVariant === 'remove'
						? getSingleItemRemoveCopy( purchase )
						: getSingleItemCancelCopy( purchase, fullExpiryDate, inGracePeriod ) }
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
					<Text as="p">
						{ purchase.is_plan
							? __( 'We will also make these changes to your site:' )
							: __( "Here's what will happen:" ) }
					</Text>
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
