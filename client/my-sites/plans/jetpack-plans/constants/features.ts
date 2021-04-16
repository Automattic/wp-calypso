/**
 * External dependencies
 */
import {
	JetpackPlanCardFeature,
	JetpackPlanCardFeatureSection,
	Plan,
} from '@automattic/calypso-products';

/**
 * Internal dependencies
 */
import { getFeatureByKey, getFeatureCategoryByKey } from 'calypso/lib/plans/features-list';
import { Product } from 'calypso/lib/products-values/products-list';
import { getForCurrentCROIteration, Iterations } from '../iterations';
import { SelectorProductFeaturesItem, SelectorProductFeaturesSection } from '../types';
import objectIsPlan from '../utils/object-is-plan';

/**
 * Builds the feature items passed to the product card, from a plan, product, or object.
 *
 * @param {Plan | Product | object} item Product, plan, or object
 * @param {object?} options Options
 * @param {string?} variation The current A/B test variation
 * @returns {SelectorProductFeaturesItem[] | SelectorProductFeaturesSection[]} Features
 */
export function buildCardFeaturesFromItem(
	item: Plan | Product | Record< string, unknown >,
	options?: Record< string, unknown >,
	variation?: Iterations
): SelectorProductFeaturesItem[] | SelectorProductFeaturesSection[] {
	if ( objectIsPlan( item ) ) {
		const features = item.getPlanCardFeatures?.( variation );

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

/**
 * Builds the feature items passed to the product card, from feature keys.
 *
 * @param {JetpackPlanCardFeature[] | JetpackPlanCardFeatureSection} features Feature keys
 * @param {object?} options Options
 * @param {string?} variation Experiment variation
 * @returns {SelectorProductFeaturesItem[] | SelectorProductFeaturesSection[]} Features
 */
function buildCardFeaturesFromFeatureKeys(
	features: JetpackPlanCardFeature[] | JetpackPlanCardFeatureSection,
	options?: Record< string, unknown >,
	variation?: Iterations
): SelectorProductFeaturesItem[] | SelectorProductFeaturesSection[] {
	if ( ! ( features instanceof Object ) ) {
		return [];
	}

	// Without sections (JetpackPlanCardFeature[])
	if ( Array.isArray( features ) ) {
		return features
			.map( ( f ) => buildCardFeatureItemFromFeatureKey( f, options, variation ) )
			.filter( ( f ): f is SelectorProductFeaturesItem => !! f );
	}

	// With sections (JetpackPlanCardFeatureSection)
	const result = [] as SelectorProductFeaturesSection[];

	Object.getOwnPropertySymbols( features ).map( ( key ) => {
		const category = getFeatureCategoryByKey( key );
		const subfeatures = features[ key ];

		if ( category ) {
			result.push( {
				heading: category.getTitle(),
				list: subfeatures.map( ( f: JetpackPlanCardFeature ) =>
					buildCardFeatureItemFromFeatureKey( f, options, variation )
				),
			} as SelectorProductFeaturesSection );
		}
	} );

	return result;
}

/**
 * Builds the feature item of a product card, from a feature key.
 *
 * @param {JetpackPlanCardFeature} featureKey Key of the feature
 * @param {object?} options Options
 * @param {string?} options.withoutDescription Whether to build the card with a description
 * @param {string?} options.withoutIcon Whether to build the card with an icon
 * @param {string?} variation Experiment variation
 * @returns {SelectorProductFeaturesItem} Feature item
 */
function buildCardFeatureItemFromFeatureKey(
	featureKey: JetpackPlanCardFeature,
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
				? subFeaturesKeys.map( ( f ) =>
						buildCardFeatureItemFromFeatureKey( f, options, variation )
				  )
				: undefined,
			isHighlighted: feature.isProduct?.( variation ) || feature.isPlan,
		};
	}
}
