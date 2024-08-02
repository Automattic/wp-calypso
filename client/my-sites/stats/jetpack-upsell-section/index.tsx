import config from '@automattic/calypso-config';
import {
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_VIDEOPRESS,
} from '@automattic/calypso-products';
import { JetpackUpsellCard } from '@automattic/components';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { useSelector } from 'calypso/state';
import { getSitePurchases } from 'calypso/state/purchases/selectors';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import usePurchasedProducts from './use-purchased-products';

const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

const CHECKOUT_URL_PREFIX = 'https://wordpress.com';
const QUERY_VALUES = {
	source: 'jetpack-stats-upsell-section',

	// Redirects to Odyssey Stats after after removing all products from the shopping cart.
	checkoutBackUrl: window.location.href,
};

export default function JetpackUpsellSection() {
	const siteSlug = useSelector( getSelectedSiteSlug );

	// NOTE: This will only work within Odyssey Stats.
	// Doesn't recogize Commercial plan bundles.
	const { purchasedProducts } = usePurchasedProducts();

	// Check for bundled products.
	// Currently checking for variations of the Complete bundle only.
	const siteId = useSelector( getSelectedSiteId );
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const hasCompleteBundle = sitePurchases?.some( ( purchase ) =>
		purchase.productSlug.includes( 'complete' )
	);

	// Exit early if we don't have and can't get the site purchase data.
	// Also exit early if we're not in the Odyssey Stats environment.
	if ( ! isOdysseyStats || hasCompleteBundle ) {
		return null;
	}

	// Build checkout URL prefixed with WordPress.com.
	// TODO: Change URL to point at plugin installation within wp-admin.
	//       (e.g., /wp-admin/update.php?action=install-plugin&plugin=plugin-name&_wpnonce=valid-nonce).
	const upgradeUrls: Record< string, string > = ! siteSlug
		? {}
		: {
				backup:
					CHECKOUT_URL_PREFIX +
					buildCheckoutURL( siteSlug, PRODUCT_JETPACK_BACKUP_T1_YEARLY, QUERY_VALUES ),
				boost:
					CHECKOUT_URL_PREFIX + buildCheckoutURL( siteSlug, PRODUCT_JETPACK_BOOST, QUERY_VALUES ),
				search:
					CHECKOUT_URL_PREFIX + buildCheckoutURL( siteSlug, PRODUCT_JETPACK_SEARCH, QUERY_VALUES ),
				security:
					CHECKOUT_URL_PREFIX +
					buildCheckoutURL( siteSlug, PLAN_JETPACK_SECURITY_T1_YEARLY, QUERY_VALUES ),
				social:
					CHECKOUT_URL_PREFIX +
					buildCheckoutURL( siteSlug, PRODUCT_JETPACK_SOCIAL_BASIC, QUERY_VALUES ),
				video:
					CHECKOUT_URL_PREFIX +
					buildCheckoutURL( siteSlug, PRODUCT_JETPACK_VIDEOPRESS, QUERY_VALUES ),
		  };

	return (
		<div className="jetpack-upsell-section">
			<JetpackUpsellCard
				purchasedProducts={ purchasedProducts }
				siteSlug={ siteSlug }
				upgradeUrls={ upgradeUrls }
			/>
		</div>
	);
}
