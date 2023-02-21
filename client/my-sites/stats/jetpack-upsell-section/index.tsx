import {
	JETPACK_BOOST_PRODUCTS,
	JETPACK_SECURITY_PLANS,
	JETPACK_SOCIAL_PRODUCTS,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_VIDEOPRESS,
	WPCOM_FEATURES_BACKUPS,
	WPCOM_FEATURES_INSTANT_SEARCH,
	WPCOM_FEATURES_VIDEOPRESS,
} from '@automattic/calypso-products';
import { JetpackUpsellCard } from '@automattic/components';
import { useSelector } from 'react-redux';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSitePlan, getSiteProducts, isJetpackSite } from 'calypso/state/sites/selectors';
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

	return useSelector( ( state ) => {
		const products = [] as string[];
		siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS ) && products.push( 'backup' );
		hasAnyProduct( siteProducts, JETPACK_BOOST_PRODUCTS ) && products.push( 'boost' );
		siteHasFeature( state, siteId, WPCOM_FEATURES_INSTANT_SEARCH ) && products.push( 'search' );
		( JETPACK_SECURITY_PLANS as readonly string[] ).includes( sitePlan?.product_slug ?? '' ) &&
			products.push( 'security' );
		hasAnyProduct( siteProducts, JETPACK_SOCIAL_PRODUCTS ) && products.push( 'social' );
		siteHasFeature( state, siteId, WPCOM_FEATURES_VIDEOPRESS ) && products.push( 'video' );
		return products;
	} );
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
				<JetpackUpsellCard
					purchasedProducts={ purchasedProducts }
					siteSlug={ siteSlug }
					upgradeUrls={ upgradeUrls }
				/>
			</div>
		)
	);
}
