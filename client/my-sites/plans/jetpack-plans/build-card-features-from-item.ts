import { Product } from '@automattic/calypso-products';
import { getFeatureByKey } from 'calypso/lib/plans/features-list';
import { getForCurrentCROIteration, Iterations } from './iterations';
import objectIsPlan from './object-is-plan';
import type { SelectorProductFeaturesItem, SelectorProductFeaturesSection } from './types';
import type { Plan } from '@automattic/calypso-products';

/**
 * Feature utils.
 */

/**
 * Builds the feature item of a product card, from a feature key.
 *
 * @param {string[]|string} featureKey Key of the feature
 * @param {object?} options Options
 * @param {string?} options.withoutDescription Whether to build the card with a description
 * @param {string?} options.withoutIcon Whether to build the card with an icon
 * @param {string?} variation Experiment variation
 * @returns {SelectorProductFeaturesItem} Feature item
 */
function buildCardFeatureItemFromFeatureKey(
	featureKey: string[] | string,
	options?: { withoutDescription?: boolean; withoutIcon?: boolean },
	variation?: string
): SelectorProductFeaturesItem | undefined {
	let feature;
	let subFeaturesKeys;

	if ( Array.isArray( featureKey ) ) {
		const [ key, subKeys ] = featureKey;

		feature = getFeatureByKey( key );
		subFeaturesKeys = subKeys;
	} else {
		feature = getFeatureByKey( featureKey );
	}

	if ( feature ) {
		return {
			slug: feature.getSlug(),
			icon: options?.withoutIcon ? undefined : feature.getIcon?.( variation ),
			text: feature.getTitle( variation ),
			description: options?.withoutDescription ? undefined : feature.getDescription?.(),
			subitems: subFeaturesKeys
				? subFeaturesKeys
						.map( ( f ) => buildCardFeatureItemFromFeatureKey( f, options, variation ) )
						.filter( Boolean )
				: undefined,
			isHighlighted: feature.isHighlighted?.() ?? false,
		};
	}
}

/**
 * Builds the feature items passed to the product card, from feature keys.
 *
 * @param {string[]} features Feature keys
 * @param {object?} options Options
 * @param {string?} variation Experiment variation
 * @returns {SelectorProductFeaturesItem[]} Features
 */
function buildCardFeaturesFromFeatureKeys(
	features: string[],
	options?: Record< string, unknown >,
	variation?: Iterations
): SelectorProductFeaturesItem[] {
	return features
		.map( ( f ) => buildCardFeatureItemFromFeatureKey( f, options, variation ) )
		.filter( Boolean );
}

/**
 * Builds the feature items passed to the product card, from a plan, product, or object.
 *
 * @param {Plan | Product | object} item Product, plan, or object
 * @param {object?} options Options
 * @param {string?} variation The current A/B test variation
 * @returns {SelectorProductFeaturesItem[] | SelectorProductFeaturesSection[]} Features
 */
export default function buildCardFeaturesFromItem(
	item: Plan | Product | Record< string, unknown >,
	options?: Record< string, unknown >,
	variation?: Iterations
): SelectorProductFeaturesItem[] | SelectorProductFeaturesSection[] {
	if ( objectIsPlan( item ) ) {
		const features = item.getPlanCardFeatures?.();

		if ( features ) {
			return buildCardFeaturesFromFeatureKeys( features, options, variation );
		}
	} else if ( typeof item.getFeatures === 'function' ) {
		const features = getForCurrentCROIteration( item.getFeatures );

		if ( features ) {
			return buildCardFeaturesFromFeatureKeys( features, options, variation );
		}
	}

	return buildCardFeaturesFromFeatureKeys( item, options, variation );
}
