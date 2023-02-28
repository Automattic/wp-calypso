import config from '@automattic/calypso-config';
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

const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
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

const URL_PREFIX = 'https://wordpress.com';
const QUERY_VALUES = {
	source: 'jetpack-stats-upsell-section',

	// Redirects to Odyssey Stats after after removing all products from the shopping cart.
	checkoutBackUrl: window.location.href,
};

export default function JetpackUpsellSection() {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );

	const purchasedProducts = usePurchasedProucts( siteId );
	const upgradeUrls: Record< string, string > = ! siteSlug
		? {}
		: {
				backup:
					URL_PREFIX + buildCheckoutURL( siteSlug, PRODUCT_JETPACK_BACKUP_T1_YEARLY, QUERY_VALUES ),
				boost: URL_PREFIX + buildCheckoutURL( siteSlug, PRODUCT_JETPACK_BOOST, QUERY_VALUES ),
				search: URL_PREFIX + buildCheckoutURL( siteSlug, PRODUCT_JETPACK_SEARCH, QUERY_VALUES ),
				security:
					URL_PREFIX + buildCheckoutURL( siteSlug, PLAN_JETPACK_SECURITY_T1_YEARLY, QUERY_VALUES ),
				social:
					URL_PREFIX + buildCheckoutURL( siteSlug, PRODUCT_JETPACK_SOCIAL_BASIC, QUERY_VALUES ),
				video: URL_PREFIX + buildCheckoutURL( siteSlug, PRODUCT_JETPACK_VIDEOPRESS, QUERY_VALUES ),
		  };

	return (
		isOdysseyStats && (
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
