import config from '@automattic/calypso-config';
import { PLAN_JETPACK_PRO_YEARLY } from '@automattic/calypso-products';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import useIsOnSale from 'calypso/my-sites/plans/jetpack-plans/use-is-on-sale';
import { useSelector } from 'calypso/state';
import { getFreshProductsList } from 'calypso/state/products-list/selectors';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteTitle } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import UpsellCard from './upsell-card';
import {
	filterUpsellsBySiteFeatures,
	filterUpsellsOnSale,
	getAvailableUpsells,
	getUpsellFeatureSlugs,
	Product,
} from './upsell-card/available-upsells';

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

function checkoutUrlForUpsell( siteId: number, upsell: Product ) {
	// TODO: Change URL to point at plugin installation within wp-admin.
	// ie: /wp-admin/update.php?action=install-plugin&plugin=plugin-name&_wpnonce=valid-nonce
	return (
		CHECKOUT_URL_PREFIX + buildCheckoutURL( siteId.toString(), upsell.checkoutSlug, QUERY_VALUES )
	);
}

function getVisibleUpsells(
	siteId: number | null,
	siteFeatures: string[],
	isOnSale?: ( productSlug: string ) => boolean
): Product[] {
	if ( ! siteId ) {
		return [];
	}

	// Hide upsells for products the site already owns, either directly or through
	// a bundling plan (e.g. don't upsell Backup to a site on Jetpack Security).
	const filteredUpsells = filterUpsellsOnSale(
		filterUpsellsBySiteFeatures( getAvailableUpsells(), siteFeatures ),
		isOnSale
	);

	// Add the checkout URL to the results.
	const finalUpsells = filteredUpsells.map( ( upsell ) => {
		return { ...upsell, checkoutUrl: checkoutUrlForUpsell( siteId, upsell ) };
	} );

	return finalUpsells;
}

export default function JetpackUpsellSection() {
	const siteId = useSelector( getSelectedSiteId );
	const siteTitle = useSelector( ( state ) => getSiteTitle( state, siteId ) );

	// New check for active site features.
	const siteFeatures = useSiteFeatures( siteId );
	const isOnSale = useIsOnSale();
	// Without the catalog, a retired Security card would look on sale. A real catalog
	// always lists Pro, on sale or not, so an error body or empty list doesn't count.
	const hasProductsList = useSelector(
		( state ) => !! getFreshProductsList( state )?.[ PLAN_JETPACK_PRO_YEARLY ]
	);

	// Early exit if we're not in the Odyssey Stats environment.
	if ( ! isOdysseyStats ) {
		return null;
	}

	// TODO: Memoize derived data setup.
	// Initial tests show the component rendering multiple times per page load.
	const upsells = getVisibleUpsells( siteId, siteFeatures, hasProductsList ? isOnSale : undefined );

	return (
		<div className="jetpack-upsell-section">
			<QueryProductsList type="jetpack" />
			<UpsellCard siteTitle={ siteTitle } upsells={ upsells } />
		</div>
	);
}
