import {
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_BOOST_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_SECURITY_PLANS,
	JETPACK_SOCIAL_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_VIDEOPRESS,
} from '@automattic/calypso-products';
import { JetpackUpsellCard } from '@automattic/components';
import { useSelector } from 'react-redux';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySiteProducts from 'calypso/components/data/query-site-products';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { getSitePlan, getSiteProducts } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

interface SiteProduct {
	productSlug: string;
}

function hasAnyProduct( siteProducts: SiteProduct[] | null, products: readonly string[] ) {
	return siteProducts?.some( ( product ) => products.includes( product.productSlug ) );
}

function usePurchasedProucts( siteId: number | null ) {
	const sitePlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const siteProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );

	const products = [] as string[];
	hasAnyProduct( siteProducts, JETPACK_BACKUP_PRODUCTS ) && products.push( 'backup' );
	hasAnyProduct( siteProducts, JETPACK_BOOST_PRODUCTS ) && products.push( 'boost' );
	hasAnyProduct( siteProducts, JETPACK_SEARCH_PRODUCTS ) && products.push( 'search' );
	( JETPACK_SECURITY_PLANS as readonly string[] ).includes( sitePlan?.product_slug ?? '' ) &&
		products.push( 'security' );
	hasAnyProduct( siteProducts, JETPACK_SOCIAL_PRODUCTS ) && products.push( 'social' );
	hasAnyProduct( siteProducts, JETPACK_VIDEOPRESS_PRODUCTS ) && products.push( 'video' );
	return products;
}

export default function JetpackUpsellSection() {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	const purchasedProducts = usePurchasedProucts( siteId );
	const upgradeUrls: Record< string, string > = ! siteSlug
		? {}
		: {
				backup: buildCheckoutURL( siteSlug, PRODUCT_JETPACK_BACKUP_T1_YEARLY ),
				boost: buildCheckoutURL( siteSlug, PRODUCT_JETPACK_BOOST ),
				search: buildCheckoutURL( siteSlug, PRODUCT_JETPACK_SEARCH ),
				security: buildCheckoutURL( siteSlug, PLAN_JETPACK_SECURITY_T1_YEARLY ),
				social: buildCheckoutURL( siteSlug, PRODUCT_JETPACK_SOCIAL_BASIC ),
				video: buildCheckoutURL( siteSlug, PRODUCT_JETPACK_VIDEOPRESS ),
		  };

	// TODO: Limit upsell section to just Odyssey.
	return (
		isJetpack && (
			<div className="jetpack-upsell-section">
				{ siteId && (
					<>
						<QuerySitePlans siteId={ siteId } />
						<QuerySiteProducts siteId={ siteId } />
					</>
				) }
				<JetpackUpsellCard
					purchasedProducts={ purchasedProducts }
					siteSlug={ siteSlug }
					upgradeUrls={ upgradeUrls }
				/>
			</div>
		)
	);
}
