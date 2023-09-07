import {
	FEATURE_ACCEPT_LOCAL_PAYMENTS,
	FEATURE_CUSTOM_DOMAIN,
	FEATURE_DISCOUNTED_SHIPPING,
	FEATURE_INTERNATIONAL_PAYMENTS,
	FEATURE_PRINT_SHIPPING_LABELS,
	FEATURE_RECURRING_PAYMENTS,
	isWooExpressPlan,
	type Feature,
} from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { useMemo } from '@wordpress/element';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import type { PlansIntent } from './use-grid-plans';

interface Props {
	plansIntent?: PlansIntent;
	forComparisonGrid?: boolean;
	siteId?: string | number | null;
}

export interface PlanFeatureFootnotesIndex {
	// This is the main list of all footnotes. It is displayed at the bottom of the comparison grid.
	footnoteList: TranslateResult[];
	// This is a map of features to the index of the footnote in the main list of footnotes.
	footnotesByFeature: Record< Feature, number >;
}

type FeatureFootnotes = [ TranslateResult, Feature[] ];

const usePlanFeatureFootnotes = ( {
	siteId,
	plansIntent,
	forComparisonGrid,
}: Props ): PlanFeatureFootnotesIndex | null => {
	const translate = useTranslate();
	const introOffers = Plans.useIntroOffers( { siteId } );

	let featureFootnotes: FeatureFootnotes[] | null = null;

	switch ( plansIntent ) {
		case 'plans-woocommerce': {
			const anyWooExpressIntroOffer = Object.keys( introOffers ?? {} ).some( ( planSlug ) =>
				isWooExpressPlan( planSlug )
			);

			if ( forComparisonGrid ) {
				featureFootnotes = [
					[
						translate(
							'Available as standard in WooCommerce Payments (restrictions apply). Additional extensions may be required for other payment providers.'
						),
						[
							FEATURE_INTERNATIONAL_PAYMENTS,
							FEATURE_ACCEPT_LOCAL_PAYMENTS,
							FEATURE_RECURRING_PAYMENTS,
						],
					],
					[
						translate(
							'Only available in the U.S. – an additional extension will be required for other countries.'
						),
						[ FEATURE_DISCOUNTED_SHIPPING, FEATURE_PRINT_SHIPPING_LABELS ],
					],
				];
			} else if ( anyWooExpressIntroOffer ) {
				featureFootnotes = [ [ translate( 'blablabla' ), [ FEATURE_CUSTOM_DOMAIN ] ] ];
			}
		}
	}

	return useMemo( () => {
		const footnoteList: TranslateResult[] = [];
		const footnotesByFeature: Record< Feature, number > = {};

		featureFootnotes?.map( ( [ footnote, features ] ) => {
			// First we add the footnote to the main list of footnotes.
			footnoteList.push( footnote );
			// Then we add each feature that has this footnote to the map of footnotes by feature.
			features.map( ( featureSlug ) => {
				footnotesByFeature[ featureSlug ] = footnoteList.length;
			} );
		} );

		if ( ! footnoteList.length ) {
			return null;
		}

		return {
			footnoteList,
			footnotesByFeature,
		};
	}, [ featureFootnotes ] );
};

export default usePlanFeatureFootnotes;
