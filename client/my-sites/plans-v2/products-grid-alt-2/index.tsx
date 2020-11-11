/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { RefObject, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { sortBy } from 'lodash';

/**
 * Internal dependencies
 */
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { JETPACK_LEGACY_PLANS } from 'calypso/lib/plans/constants';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import JetpackFreeCard from 'calypso/components/jetpack/card/jetpack-free-card-alt';
import { slugToSelectorProduct } from '../utils';
import useGetPlansGridProducts from '../use-get-plans-grid-products';
import { isJetpackPlanSlug } from 'calypso/lib/products-values';
import { getProductPosition } from '../product-grid/products-order';
import ProductCardAlt2 from '../product-card-alt-2';
import { getPlansToDisplay, getProductsToDisplay, isConnectionFlow } from '../product-grid/utils';

/**
 * Type dependencies
 */
import type { ProductsGridProps } from '../types';

/**
 * Style dependencies
 */
import './style.scss';

const ProductsGridAlt2: React.FC< ProductsGridProps > = ( {
	duration,
	onSelectProduct,
	urlQueryArgs,
} ) => {
	const [ isPlanRowExpanded, setPlanRowExpanded ] = useState( true );
	const [ isPlanRowWrapping, setPlanRowWrapping ] = useState( false );

	const siteId = useSelector( getSelectedSiteId );
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const currentPlanSlug =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;

	const { availableProducts, purchasedProducts, includedInPlanProducts } = useGetPlansGridProducts(
		siteId
	);

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
	const sortedGridItems = useMemo(
		() =>
			sortBy( [ ...plansToDisplay, ...productsToDisplay ], ( item ) =>
				getProductPosition( item.productSlug )
			),
		[ plansToDisplay, productsToDisplay ]
	);
	const planItems = useMemo(
		() => sortedGridItems.filter( ( { productSlug } ) => isJetpackPlanSlug( productSlug ) ),
		[ sortedGridItems ]
	);
	const productItems = useMemo(
		() => sortedGridItems.filter( ( { productSlug } ) => ! isJetpackPlanSlug( productSlug ) ),
		[ sortedGridItems ]
	);

	const planGridRef: RefObject< HTMLDivElement > = useRef( null );

	const onPlanRowFeaturesToggle = useCallback( () => setPlanRowExpanded( ! isPlanRowExpanded ), [
		isPlanRowExpanded,
	] );
	const onResize = useCallback( () => {
		if ( planGridRef ) {
			const { current: grid } = planGridRef;

			if ( grid ) {
				const firstChild = grid.children[ 0 ];

				if ( firstChild instanceof HTMLElement ) {
					const firtRowItemCount = Math.floor( grid.offsetWidth / firstChild.offsetWidth );

					setPlanRowWrapping( firtRowItemCount < planItems.length );
				}
			}
		}
	}, [ planGridRef, planItems ] );

	const hasLegacyPlan = currentPlanSlug && JETPACK_LEGACY_PLANS.includes( currentPlanSlug );
	const isInConnectFlow = useMemo( isConnectionFlow, [] );
	const showJetpackFreeCard = isInConnectFlow || isJetpackCloud();
	const currentPlan = currentPlanSlug && slugToSelectorProduct( currentPlanSlug );

	useEffect( () => {
		onResize();
		window.addEventListener( 'resize', onResize );

		return () => window.removeEventListener( 'resize', onResize );
	}, [ onResize ] );

	return (
		<>
			<div
				className={ classNames( 'products-grid-alt-2 has-plans', {
					'is-wrapping': isPlanRowWrapping,
				} ) }
				ref={ planGridRef }
			>
				{ planItems.map( ( product ) => (
					<ProductCardAlt2
						key={ product.iconSlug }
						item={ product }
						onClick={ onSelectProduct }
						siteId={ siteId }
						currencyCode={ currencyCode }
						selectedTerm={ duration }
						shouldExpand={ isPlanRowWrapping ? undefined : isPlanRowExpanded }
						onFeaturesToggle={ isPlanRowWrapping ? undefined : onPlanRowFeaturesToggle }
					/>
				) ) }
			</div>
			<div className="products-grid-alt-2">
				{ hasLegacyPlan && currentPlan && (
					<ProductCardAlt2
						key={ currentPlanSlug as string }
						item={ currentPlan }
						onClick={ onSelectProduct }
						siteId={ siteId }
						currencyCode={ currencyCode }
						selectedTerm={ duration }
					/>
				) }

				{ productItems.map( ( product ) => (
					<ProductCardAlt2
						key={ product.iconSlug }
						item={ product }
						onClick={ onSelectProduct }
						siteId={ siteId }
						currencyCode={ currencyCode }
						selectedTerm={ duration }
					/>
				) ) }

				{ showJetpackFreeCard && siteId && (
					<JetpackFreeCard siteId={ siteId } urlQueryArgs={ urlQueryArgs } />
				) }
			</div>
		</>
	);
};

export default ProductsGridAlt2;
