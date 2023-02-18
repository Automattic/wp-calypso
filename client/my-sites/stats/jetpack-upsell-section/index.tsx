import {
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_VIDEOPRESS,
} from '@automattic/calypso-products';
import { JetpackUpsellCard } from '@automattic/components';
import { useSelector } from 'react-redux';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getSitePlan, getSiteProducts, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export default function JetpackUpsellSection() {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );

	const sitePlan = useSelector( ( state ) => getSitePlan( state, siteId ) );
	const siteProducts = useSelector( ( state ) => getSiteProducts( state, siteId ) );
	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	// TODO: Get purchased products from site.
	console.log( 'sitePlan', sitePlan );
	console.log( 'siteProducts', siteProducts );
	console.log( 'purchases', purchases );
	const purchasedProducts = [] as string[];

	// TODO: Figure out how to trigger plugin installation for free products instead of sending to checkout.
	const upgradeUrls: Record< string, string > = ! siteSlug
		? {}
		: {
				backup: buildCheckoutURL( siteSlug, PRODUCT_JETPACK_BACKUP_T1_YEARLY ),
				boost: buildCheckoutURL( siteSlug, PRODUCT_JETPACK_BOOST ),
				crm: buildCheckoutURL( siteSlug, PRODUCT_JETPACK_CRM ),
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
