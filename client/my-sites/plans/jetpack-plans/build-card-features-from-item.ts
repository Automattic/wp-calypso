import { Product } from '@automattic/calypso-products';
import { getFeatureByKey } from 'calypso/lib/plans/features-list';
import objectIsPlan from './object-is-plan';
import type { SelectorProductFeaturesItem } from './types';
import type { Plan, Feature } from '@automattic/calypso-products';

/**
 * Feature utils.
 */

/**
 * Builds the feature item of a product card, from a feature key.
 *
 * @param {Feature[]|Feature} featureKey Key of the feature
 * @returns {SelectorProductFeaturesItem} Feature item
 */
function buildCardFeatureItemFromFeatureKey(
	featureKey: Feature
): SelectorProductFeaturesItem | undefined {
	const feature = getFeatureByKey( featureKey );

	if ( feature ) {
		return {
			slug: feature.getSlug(),
			text: feature.getTitle(),
		};
	}
}

/**
 * Builds the feature items passed to the product card, from feature keys.
 *
 * @param {Feature[]} features Feature keys
 * @returns {SelectorProductFeaturesItem[]} Features
 */
function buildCardFeaturesFromFeatureKeys( features: Feature[] ): SelectorProductFeaturesItem[] {
	return features
		.map( ( f ) => buildCardFeatureItemFromFeatureKey( f ) )
		.filter( Boolean ) as SelectorProductFeaturesItem[];
}

/**
 * Builds the feature items passed to the product card, from a plan, product, or features array.
 *
 * @param {Plan | Product | Feature[]} item Product, plan, or features array
 * @returns {SelectorProductFeaturesItem[]} Features
 */
export default function buildCardFeaturesFromItem(
	item: Plan | Product | Feature[]
): SelectorProductFeaturesItem[] {
	if ( Array.isArray( item ) ) {
		return buildCardFeaturesFromFeatureKeys( item );
	}

	let features;

	if ( objectIsPlan( item as Plan ) ) {
		features = ( item as Plan ).getPlanCardFeatures?.();
	} else {
		features = ( item as Product ).getFeatures?.();
	}

	return features ? buildCardFeaturesFromFeatureKeys( features ) : [];
}
