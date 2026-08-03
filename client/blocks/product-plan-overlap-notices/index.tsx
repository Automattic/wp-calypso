import {
	isJetpackProduct,
	planHasFeature,
	planHasSuperiorFeature,
	JETPACK_SEARCH_PRODUCTS,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import Notice from 'calypso/dashboard/components/notice';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getAvailableProductsList } from 'calypso/state/products-list/selectors';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getSitePlanSlug } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

import './style.scss';

interface ProductPlanOverlapNoticesProps {
	/** Plan slugs that we consider as possibly overlapping with products. */
	plans: readonly string[];
	/** Product slugs that we consider as possibly overlapping with plans. */
	products: readonly string[];
	/** Site to fetch purchases and plans for; defaults to the selected site. */
	siteId?: number | null;
	/** Used by the purchase detail page to hide the notice when not relevant. */
	currentPurchase?: Purchase;
}

export default function ProductPlanOverlapNotices( {
	plans,
	products,
	siteId,
	currentPurchase,
}: ProductPlanOverlapNoticesProps ) {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	const selectedSiteId = useSelector( ( state ) => siteId || getSelectedSiteId( state ) );
	const availableProducts = useSelector( getAvailableProductsList ) as Record<
		string,
		ProductListItem
	>;
	const currentPlanSlug = useSelector( ( state ) =>
		selectedSiteId ? getSitePlanSlug( state, selectedSiteId ) : null
	);
	const purchases = useSelector( ( state ) => getSitePurchases( state, selectedSiteId ) );

	const getProductName = ( productSlug: string ) =>
		availableProducts[ productSlug ]?.product_name ?? '';

	const getProductItem = ( productSlug: string ) => {
		const productPurchase = purchases.find( ( purchase ) => purchase.productSlug === productSlug );

		if ( ! productPurchase ) {
			return null;
		}

		return (
			<li key={ productSlug }>
				<a
					href={ getManagePurchaseUrlFor( productPurchase.domain, productPurchase.id ) }
					onClick={ () =>
						reduxDispatch(
							recordTracksEvent( 'calypso_product_overlap_purchase_click', {
								purchase_slug: productSlug,
							} )
						)
					}
				>
					{ getProductName( productSlug ) }
				</a>
			</li>
		);
	};

	// Is the current plan among the plans we're interested in?
	const isOverlappingPlan = Boolean( currentPlanSlug && plans.includes( currentPlanSlug ) );

	// Which of the products we're interested in are currently purchased?
	const currentProductSlugs = purchases
		.filter( ( purchase ) => products.includes( purchase.productSlug ) )
		.map( ( purchase ) => purchase.productSlug );

	// Does the current plan include any of those products as a feature, or have a superior version of it?
	const overlappingProductSlugs =
		isOverlappingPlan && currentPlanSlug
			? currentProductSlugs
					.filter(
						( productSlug ) =>
							// Skip the check for search products, they are included only partially (up to 100k records/requests)
							! ( JETPACK_SEARCH_PRODUCTS as ReadonlyArray< string > ).includes( productSlug ) &&
							( planHasFeature( currentPlanSlug, productSlug ) ||
								planHasSuperiorFeature( currentPlanSlug, productSlug ) )
					)
					.sort()
			: [];

	const showOverlap =
		overlappingProductSlugs.length > 0 &&
		! (
			currentPurchase &&
			isJetpackProduct( currentPurchase ) &&
			! overlappingProductSlugs.includes( currentPurchase.productSlug )
		);

	return (
		<>
			<QuerySitePlans siteId={ selectedSiteId } />
			<QuerySitePurchases siteId={ selectedSiteId } />
			<QueryProductsList />

			{ showOverlap && (
				<Notice variant="info">
					{ translate(
						'Your %(planName)s Plan includes:' +
							'{{list/}}' +
							'Consider removing conflicting products.',
						{
							args: {
								planName: currentPlanSlug ? getProductName( currentPlanSlug ) : '',
							},
							components: {
								list: (
									<ul className="product-plan-overlap-notices__product-list">
										{ overlappingProductSlugs.map( ( productSlug ) =>
											getProductItem( productSlug )
										) }
									</ul>
								),
							},
						}
					) }
				</Notice>
			) }
		</>
	);
}
