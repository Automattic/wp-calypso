/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { durationToText, slugToItem, itemToSelectorProduct, productButtonLabel } from '../utils';
import {
	PRODUCTS_TYPES,
	SELECTOR_PLANS,
	OPTIONS_JETPACK_SECURITY,
	OPTIONS_JETPACK_SECURITY_MONTHLY,
} from '../constants';
import { PLAN_JETPACK_FREE } from 'lib/plans/constants';
import { getProductCost, isProductsListFetching } from 'state/products-list/selectors';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import getSitePlan from 'state/sites/selectors/get-site-plan';
import JetpackBundleCard from 'components/jetpack/card/jetpack-bundle-card';
import JetpackPlanCard from 'components/jetpack/card/jetpack-plan-card';
import FormattedHeader from 'components/formatted-header';

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

type PlanWithBought = SelectorProduct & { owned: boolean; legacy: boolean };

const PlanComponent = ( {
	plan,
	onClick,
	currencyCode,
}: {
	plan: PlanWithBought;
	onClick: PurchaseCallback;
	currencyCode: string;
} ) => {
	const price =
		useSelector( ( state ) => getProductCost( state, plan.costProductSlug || plan.productSlug ) ) ||
		0;
	const CardComponent = [ OPTIONS_JETPACK_SECURITY, OPTIONS_JETPACK_SECURITY_MONTHLY ].includes(
		plan.productSlug
	)
		? JetpackBundleCard
		: JetpackPlanCard;
	return (
		<CardComponent
			iconSlug={ plan.iconSlug }
			productName={ plan.displayName }
			subheadline={ plan.tagline }
			description={ plan.description }
			currencyCode={ currencyCode }
			billingTimeFrame={ durationToText( plan.term ) }
			buttonLabel={ productButtonLabel( plan ) }
			onButtonClick={ () => onClick( plan ) }
			features={ { items: [] } }
			originalPrice={ price }
			withStartingPrice={ Array.isArray( plan.subtypes ) && plan.subtypes.length > 0 }
			isOwned={ plan.owned }
			isDeprecated={ plan.legacy }
		/>
	);
};

const PlansColumn = ( { duration, onPlanClick, productType, siteId }: PlanColumnType ) => {
	const currencyCode = useSelector( ( state ) => getCurrentUserCurrencyCode( state ) );
	const isFetchingProducts = useSelector( ( state ) => isProductsListFetching( state ) );
	const currentPlan =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;

	// This gets all plan objects for us to parse.
	const planObjects: PlanWithBought[] = useMemo( () => {
		let owned = false;
		// Map over all plan slugs and convert them to SelectorProduct types.
		const plans: PlanWithBought[] = SELECTOR_PLANS.map( ( productSlug ) => {
			const item = slugToItem( productSlug );
			if ( ! owned && currentPlan ) {
				// Check if we own a plan in here. If we don't the user has a legacy plan, handled below.
				owned = productSlug === currentPlan;
			}
			return item && itemToSelectorProduct( item );
		} )
			// Remove plans that don't fit the filters or have invalid data.
			.filter(
				( product: SelectorProduct | null ): product is SelectorProduct =>
					!! product &&
					duration === product.term &&
					PRODUCTS_TYPES[ productType ].includes( product.productSlug )
			)
			// Iterate over plans and set whether they are legacy and if the user owns them.
			.map( ( product: SelectorProduct ) => ( {
				...product,
				owned: product.productSlug === currentPlan,
				legacy: false,
			} ) );

		// If the user does not own a current plan, get it and insert it on the top of the plan array.
		if ( ! owned && currentPlan && currentPlan !== PLAN_JETPACK_FREE ) {
			const item = slugToItem( currentPlan );
			const currentPlanSelector = item && itemToSelectorProduct( item );
			if ( currentPlanSelector ) {
				plans.unshift( { ...currentPlanSelector, owned: true, legacy: true } );
			}
		}
		return plans;
	}, [ duration, productType, currentPlan ] );

	if ( ! currencyCode || isFetchingProducts ) {
		return null; // TODO: Loading component!
	}

	return (
		<div className="plans-column">
			<FormattedHeader headerText={ translate( 'Plans' ) } brandFont />
			{ planObjects.map( ( plan ) => (
				<PlanComponent
					key={ plan.productSlug }
					onClick={ onPlanClick }
					plan={ plan }
					currencyCode={ currencyCode }
				/>
			) ) }
		</div>
	);
};

export default PlansColumn;
