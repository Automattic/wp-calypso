/**
 * External dependencies
 */
import React, { ReactElement, useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { getMonthlyPlanByYearly, getYearlyPlanByMonthly } from 'calypso/lib/plans';
import { JETPACK_LEGACY_PLANS } from 'calypso/lib/plans/constants';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import JetpackFreeCard from 'calypso/components/jetpack/card/jetpack-free-card';
import { SELECTOR_PLANS } from '../constants';
import {
	getAllOptionsFromSlug,
	getJetpackDescriptionWithOptions,
	slugToSelectorProduct,
} from '../utils';
import useGetPlansGridProducts from '../use-get-plans-grid-products';
import ProductCardAlt from '../product-card-alt';

/**
 * Type dependencies
 */
import type { Duration, PurchaseCallback, QueryArgs, SelectorProduct } from '../types';

/**
 * Style dependencies
 */
import './style.scss';

// Map over all plan slugs and convert them to SelectorProduct types.
const getPlansToDisplay = ( {
	duration,
	currentPlanSlug,
}: {
	duration: Duration;
	currentPlanSlug: string | null;
} ): SelectorProduct[] => {
	const currentPlanTerms = currentPlanSlug
		? [ getMonthlyPlanByYearly( currentPlanSlug ), getYearlyPlanByMonthly( currentPlanSlug ) ]
		: [];

	const currentPlanOptions = currentPlanSlug ? getAllOptionsFromSlug( currentPlanSlug ) : [];

	const plansToDisplay = SELECTOR_PLANS.map( slugToSelectorProduct )
		// Remove plans that don't fit the filters or have invalid data.
		.filter(
			( product: SelectorProduct | null ): product is SelectorProduct =>
				!! product &&
				product.term === duration &&
				// Don't include a plan the user already owns, regardless of the term
				! currentPlanTerms.includes( product.productSlug ) &&
				// Don't include a plan option if the user already owns a related option
				! currentPlanOptions.includes( product.productSlug )
		)
		.map( ( product: SelectorProduct ) => ( {
			...product,
			description: getJetpackDescriptionWithOptions( product ),
		} ) );

	if (
		currentPlanSlug &&
		( JETPACK_LEGACY_PLANS.includes( currentPlanSlug ) ||
			SELECTOR_PLANS.includes( currentPlanSlug ) )
	) {
		const currentPlanSelectorProduct = slugToSelectorProduct( currentPlanSlug );
		if ( currentPlanSelectorProduct ) {
			return [ currentPlanSelectorProduct, ...plansToDisplay ];
		}
	}

	return plansToDisplay;
};

const getProductsToDisplay = ( {
	duration,
	availableProducts,
	purchasedProducts,
	includedInPlanProducts,
}: {
	duration: Duration;
	availableProducts: ( SelectorProduct | null )[];
	purchasedProducts: ( SelectorProduct | null )[];
	includedInPlanProducts: ( SelectorProduct | null )[];
} ) => {
	// Products that have not been directly purchased must honor the current filter
	// selection since they exist in both monthly and yearly version.
	const filteredProducts = [ ...includedInPlanProducts, ...availableProducts ]
		// Remove products that don't match the selected duration
		.filter( ( product ): product is SelectorProduct => product?.term === duration );
	return (
		[ ...purchasedProducts, ...filteredProducts ]
			// Make sure we don't allow any null or invalid products
			.filter( ( product ): product is SelectorProduct => !! product )
			.map( ( product ) => ( {
				...product,
				description: getJetpackDescriptionWithOptions( product as SelectorProduct ),
			} ) )
	);
};

const ProductsGridAlt = ( {
	duration,
	onSelectProduct,
	urlQueryArgs,
}: {
	duration: Duration;
	onSelectProduct: PurchaseCallback;
	urlQueryArgs: QueryArgs;
} ): ReactElement => {
	const siteId = useSelector( getSelectedSiteId );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const { availableProducts, purchasedProducts, includedInPlanProducts } = useGetPlansGridProducts(
		siteId
	);

	const currentPlanSlug =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;

	const plansToDisplay = useMemo( () => getPlansToDisplay( { duration, currentPlanSlug } ), [
		duration,
		currentPlanSlug,
	] );
	const productsToDisplay = useMemo(
		() =>
			getProductsToDisplay( {
				duration,
				availableProducts,
				purchasedProducts,
				includedInPlanProducts,
			} ),
		[ duration, availableProducts, includedInPlanProducts, purchasedProducts ]
	);

	const isInConnectFlow = useMemo(
		() =>
			/jetpack\/connect\/plans/.test( window.location.href ) ||
			/source=jetpack-connect-plans/.test( window.location.href ),
		[]
	);
	const showJetpackFreeCard = isInConnectFlow || isJetpackCloud();

	return (
		<div className="products-grid-alt">
			{ plansToDisplay.map( ( plan ) => (
				<ProductCardAlt
					// iconSlug has the same value for all durations.
					// Using this value as a key prevents unnecessary DOM updates.
					key={ plan.iconSlug }
					item={ plan }
					siteId={ siteId }
					onClick={ onSelectProduct }
					currencyCode={ currencyCode }
					selectedTerm={ duration }
				/>
			) ) }
			{ productsToDisplay.map( ( product ) => (
				<ProductCardAlt
					// iconSlug has the same value for all durations.
					// Using this value as a key prevents unnecessary DOM updates.
					key={ product.iconSlug }
					item={ product }
					onClick={ onSelectProduct }
					siteId={ siteId }
					currencyCode={ currencyCode }
				/>
			) ) }
			{ showJetpackFreeCard && <JetpackFreeCard siteId={ siteId } urlQueryArgs={ urlQueryArgs } /> }
		</div>
	);
};

export default ProductsGridAlt;
