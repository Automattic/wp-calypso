import config from '@automattic/calypso-config';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';
import UpsellCard from './upsell-card';
import {
	getAvailableUpsells,
	getUpsellFeatureSlugs,
	Product,
} from './upsell-card/available-upsells';

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
	const upsellFeatures = getUpsellFeatureSlugs();
	const activeFeatures = useSelector( ( state ) =>
		upsellFeatures.filter( ( feature ) => siteHasFeature( state, siteId, feature ) )
	);
	return activeFeatures;
}

function checkoutUrlForUpsell( siteSlug: string, upsell: Product ) {
	// TODO: Change URL to point at plugin installation within wp-admin.
	// ie: /wp-admin/update.php?action=install-plugin&plugin=plugin-name&_wpnonce=valid-nonce
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

	// Early exit if we're not in the Odyssey Stats environment.
	if ( ! isOdysseyStats ) {
		return null;
	}

	// TODO: Memoize derived data setup.
	// Initial tests show the component rendering multiple times per page load.
	const upsells = getVisibleUpsells( siteSlug, siteFeatures );

	return (
		<div className="jetpack-upsell-section">
			<UpsellCard siteSlug={ siteSlug } upsells={ upsells } />
		</div>
	);
}
