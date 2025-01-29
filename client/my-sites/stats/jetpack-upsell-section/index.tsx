import config from '@automattic/calypso-config';
import {
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BOOST,
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SOCIAL_BASIC,
	PRODUCT_JETPACK_VIDEOPRESS,
} from '@automattic/calypso-products';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import UpsellCard from './upsell-card';
import { getAvailableUpsells, Product } from './upsell-card/available-upsells';

// TODO: Delete use-purchased-products.tsx
// TODO: Check usage of hasBusinessPlan, hasCompletePlan, hasSecurityPlan or delete

const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

const CHECKOUT_URL_PREFIX = 'https://wordpress.com';
const QUERY_VALUES = {
	source: 'jetpack-stats-upsell-section',

	// Redirects to Odyssey Stats after after removing all products from the shopping cart.
	checkoutBackUrl: window.location.href,
};

function useSiteFeatures( siteId: number | null ) {
	const upsellFeatures = [ 'videopress', 'videopress-1tb-storage' ];
	const activeFeatures = useSelector( ( state ) =>
		upsellFeatures.filter( ( feature ) => siteHasFeature( state, siteId, feature ) )
	);
	return activeFeatures;
}

function checkoutUrlForUpsell( siteSlug: string, upsell: Product ) {
	return CHECKOUT_URL_PREFIX + buildCheckoutURL( siteSlug, upsell.checkoutSlug, QUERY_VALUES );
}

function getVisibleUpsells( siteSlug: string | null, siteFeatures: string[] ): Product[] {
	if ( ! siteSlug ) {
		return [];
	}

	// Filter available upsells against site features.
	// If an upsell has even one feature that is not active on the site, present it to the user.
	const filteredUpsells = getAvailableUpsells().filter( ( upsell ) =>
		upsell.features.some( ( feature ) => ! siteFeatures.includes( feature ) )
	);

	// Add the checkout URL to the results.
	const finalUpsells = filteredUpsells.map( ( upsell ) => {
		return { ...upsell, checkoutUrl: checkoutUrlForUpsell( siteSlug, upsell ) };
	} );

	return finalUpsells;
}

export default function JetpackUpsellSection() {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );

	// New check for active site features.
	const siteFeatures = useSiteFeatures( siteId );

	// Exit early if we don't have and can't get the site purchase data.
	// Also exit early if we're not in the Odyssey Stats environment.
	if ( ! isOdysseyStats ) {
		return null;
	}

	const upsells = getVisibleUpsells( siteSlug, siteFeatures );
	// eslint-disable-next-line no-console
	console.log( 'upsells: ', upsells );

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
			<UpsellCard siteSlug={ siteSlug } upsells={ upsells } upgradeUrls={ upgradeUrls } />
		</div>
	);
}
