/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { PRODUCTS_TYPES, SELECTOR_PLANS } from '../constants';
import {
	getAllOptionsFromSlug,
	getJetpackDescriptionWithOptions,
	slugToSelectorProduct,
} from '../utils';
import ProductCard from '../product-card';
import { getMonthlyPlanByYearly, getYearlyPlanByMonthly } from 'calypso/lib/plans';
import { JETPACK_LEGACY_PLANS, PLAN_JETPACK_FREE } from 'calypso/lib/plans/constants';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import FormattedHeader from 'calypso/components/formatted-header';

/**
 * Type dependencies
 */
import type { Duration, PurchaseCallback, ProductType, SelectorProduct } from '../types';

interface PlanColumnType {
	duration: Duration;
	onPlanClick: PurchaseCallback;
	productType: ProductType;
	siteId: number | null;
}

const PlansColumn = ( { duration, onPlanClick, productType, siteId }: PlanColumnType ) => {
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const currentPlan =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;

	const optionsFromCurrentPlan = ( currentPlan && getAllOptionsFromSlug( currentPlan ) ) || [];

	const currentPlanAllTerms = currentPlan
		? [ getMonthlyPlanByYearly( currentPlan ), getYearlyPlanByMonthly( currentPlan ) ]
		: [];

	// This gets all plan objects for us to parse.
	const planObjects: SelectorProduct[] = useMemo( () => {
		// Map over all plan slugs and convert them to SelectorProduct types.
		const plans: SelectorProduct[] = SELECTOR_PLANS.map( slugToSelectorProduct )
			// Remove plans that don't fit the filters or have invalid data.
			.filter(
				( product: SelectorProduct | null ): product is SelectorProduct =>
					!! product &&
					duration === product.term &&
					PRODUCTS_TYPES[ productType ].includes( product.productSlug ) &&
					// Don't include a card of a plan the user already owns regardless of the term
					! currentPlanAllTerms.includes( product.productSlug ) &&
					// Don't include a generic/option card if the user already owns a subtype
					! optionsFromCurrentPlan.includes( product.productSlug )
			)
			.map( ( product: SelectorProduct ) => ( {
				...product,
				description: getJetpackDescriptionWithOptions( product ),
			} ) );

		// If the user owns a plan, get it and insert it on the top of the plan array.
		if (
			currentPlan &&
			currentPlan !== PLAN_JETPACK_FREE &&
			( JETPACK_LEGACY_PLANS.includes( currentPlan ) ||
				PRODUCTS_TYPES[ productType ].includes( currentPlan ) )
		) {
			const item = slugToSelectorProduct( currentPlan );
			if ( item ) {
				plans.unshift( item );
			}
		}
		return plans;
	}, [ duration, productType, currentPlan, currentPlanAllTerms, optionsFromCurrentPlan ] );

	return (
		<div className="plans-column">
			<FormattedHeader headerText={ translate( 'Plans' ) } isSecondary brandFont />
			{ planObjects.map( ( plan ) => (
				<ProductCard
					// iconSlug has the same value for all durations. Using this value as a key
					// prevents unnecessary DOM updates.
					key={ plan.iconSlug }
					item={ plan }
					siteId={ siteId }
					onClick={ onPlanClick }
					currencyCode={ currencyCode }
					highlight
					selectedTerm={ duration }
				/>
			) ) }
		</div>
	);
};

export default PlansColumn;
