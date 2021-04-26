/**
 * External dependencies
 */
import classNames from 'classnames';
import { sortBy } from 'lodash';
import { useTranslate } from 'i18n-calypso';
import React, { useMemo, useRef, useState, useEffect, useCallback, RefObject } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import PlansFilterBar from '../plans-filter-bar';
import ProductCard from '../product-card';
import { getProductPosition } from '../product-grid/products-order';
import { getPlansToDisplay, getProductsToDisplay, isConnectionFlow } from './utils';
import useGetPlansGridProducts from '../use-get-plans-grid-products';
import JetpackFreeCard from 'calypso/components/jetpack/card/jetpack-free-card';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import {
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
} from '@automattic/calypso-products';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import MoreInfoBox from '../more-info-box';
import StoreFooter from 'calypso/jetpack-connect/store-footer';

/**
 * Type dependencies
 */
import type { ProductsGridProps, SelectorProduct } from '../types';
import type { JetpackProductSlug } from '@automattic/calypso-products';
import type { JetpackPlanSlugs } from '@automattic/calypso-products';

/**
 * Style dependencies
 */
import './style.scss';

const ProductGrid: React.FC< ProductsGridProps > = ( {
	duration,
	onSelectProduct,
	urlQueryArgs,
	onDurationChange,
} ) => {
	const translate = useTranslate();

	const bundleComparisonRef = useRef< null | HTMLElement >( null );
	const planGridRef: RefObject< HTMLUListElement > = useRef( null );
	const [ isPlanRowWrapping, setPlanRowWrapping ] = useState( false );

	const siteId = useSelector( getSelectedSiteId );
	// If a site is passed by URL and the site is found in the app's state, we will assume the site
	// is connected, and thus, we don't need to show the Jetpack Free card.
	const isSiteInContext = !! siteId;
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const currentPlanSlug =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;

	const { availableProducts, purchasedProducts, includedInPlanProducts } = useGetPlansGridProducts(
		siteId
	);

	const isInConnectFlow = useMemo( isConnectionFlow, [] );
	const isInJetpackCloud = useMemo( isJetpackCloud, [] );
	const sortedPlans = useMemo(
		() =>
			sortBy( getPlansToDisplay( { duration, currentPlanSlug } ), ( item ) =>
				getProductPosition( item.productSlug as JetpackPlanSlugs )
			),
		[ duration, currentPlanSlug ]
	);
	const sortedProducts = useMemo(
		() =>
			sortBy(
				getProductsToDisplay( {
					duration,
					availableProducts,
					purchasedProducts,
					includedInPlanProducts,
				} ),
				( item ) => getProductPosition( item.productSlug as JetpackProductSlug )
			),
		[ duration, availableProducts, includedInPlanProducts, purchasedProducts ]
	);

	let popularProducts = [] as SelectorProduct[];
	let otherProducts = [] as SelectorProduct[];

	const allProducts = sortBy( [ ...sortedPlans, ...sortedProducts ], ( item ) =>
		getProductPosition( item.productSlug as JetpackPlanSlugs | JetpackProductSlug )
	);
	popularProducts = allProducts.slice( 0, 3 );
	otherProducts = allProducts.slice( 3 );

	const scrollToComparison = () => {
		if ( bundleComparisonRef.current ) {
			bundleComparisonRef.current?.scrollIntoView( {
				behavior: 'smooth',
			} );
		}
	};

	const onResize = useCallback( () => {
		if ( planGridRef ) {
			const { current: grid } = planGridRef;

			if ( grid ) {
				const firstChild = grid.children[ 0 ];

				if ( firstChild instanceof HTMLElement ) {
					const itemCount = Math.round( grid.offsetWidth / firstChild.offsetWidth );

					setPlanRowWrapping( itemCount < sortedPlans.length );
				}
			}
		}
	}, [ planGridRef, sortedPlans ] );

	useEffect( () => {
		onResize();
		window.addEventListener( 'resize', onResize );

		return () => window.removeEventListener( 'resize', onResize );
	}, [ onResize ] );

	return (
		<>
			<section className="product-grid__section">
				<h2 className="product-grid__section-title">{ translate( 'Most Popular' ) }</h2>
				<div className="product-grid__filter-bar">
					<PlansFilterBar
						showDiscountMessage
						onDurationChange={ onDurationChange }
						duration={ duration }
					/>
				</div>
				<ul
					className={ classNames( 'product-grid__plan-grid', {
						'is-wrapping': isPlanRowWrapping,
					} ) }
					ref={ planGridRef }
				>
					{ popularProducts.map( ( product ) => (
						<li key={ product.iconSlug }>
							<ProductCard
								item={ product }
								onClick={ onSelectProduct }
								siteId={ siteId }
								currencyCode={ currencyCode }
								selectedTerm={ duration }
								isAligned={ ! isPlanRowWrapping }
								featuredPlans={ [
									PLAN_JETPACK_SECURITY_DAILY,
									PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
								] }
							/>
						</li>
					) ) }
				</ul>
				<div
					className={ classNames( 'product-grid__more', {
						'is-detached': isPlanRowWrapping,
					} ) }
				>
					<MoreInfoBox
						headline={ translate( 'Need more info?' ) }
						buttonLabel={ translate( 'Compare all product bundles' ) }
						onButtonClick={ scrollToComparison }
					/>
				</div>
			</section>
			<section className="product-grid__section product-grid__asterisk-items">
				<ul className="product-grid__asterisk-list">
					<li className="product-grid__asterisk-item">
						{ translate( 'Special introductory pricing, all renewals are at full price.' ) }
					</li>
					<li className="product-grid__asterisk-item">
						{ translate( 'Monthly plans are 7-day money back guarantee.' ) }
					</li>
					<li className="product-grid__asterisk-item">
						{ translate( 'All plans include priority support' ) }
					</li>
				</ul>
			</section>
			<section className="product-grid__section">
				<h2 className="product-grid__section-title">{ translate( 'More Products' ) }</h2>
				<ul className="product-grid__product-grid">
					{ otherProducts.map( ( product ) => (
						<li key={ product.iconSlug }>
							<ProductCard
								item={ product }
								onClick={ onSelectProduct }
								siteId={ siteId }
								currencyCode={ currencyCode }
								selectedTerm={ duration }
							/>
						</li>
					) ) }
				</ul>
				<div className="product-grid__free">
					{ ( isInConnectFlow || ( isInJetpackCloud && ! isSiteInContext ) ) && (
						<JetpackFreeCard siteId={ siteId } urlQueryArgs={ urlQueryArgs } />
					) }
				</div>
			</section>
			<StoreFooter />
		</>
	);
};

export default ProductGrid;
