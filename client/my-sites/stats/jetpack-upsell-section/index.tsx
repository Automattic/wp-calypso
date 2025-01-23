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
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteSlug, getSelectedSiteId } from 'calypso/state/ui/selectors';

const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

const CHECKOUT_URL_PREFIX = 'https://wordpress.com';
const QUERY_VALUES = {
	source: 'jetpack-stats-upsell-section',

	// Redirects to Odyssey Stats after after removing all products from the shopping cart.
	checkoutBackUrl: window.location.href,
};

function useSiteFeatures( siteId: number | null ) {
	// Hard-coded list of features that correspond to upsells.
	// This should come from somewhere. Maybe from a query.
	// Matches security, backup, search, video, boost, social.
	const upsellFeatures = [
		// Backup
		'backups',
		'restore',
		// Boost
		'cloud-critical-css',
		'cornerstone-10-pages',
		'image-cdn-liar',
		'image-cdn-quality',
		'image-size-analysis',
		'performance-history',
		// Security
		'scan',
		// Search
		'search',
		'instant-search',
		// Social
		'social-enhanced-publishing',
		'social-image-generator',
		'subscriber-unlimited-imports',
		// Video
		'videopress',
		'videopress-1tb-storage',
	];
	// Ideally we'd make a single call to get the full array of features but this will work for now.
	const activeFeatures = useSelector( ( state ) =>
		upsellFeatures.filter( ( feature ) => siteHasFeature( state, siteId, feature ) )
	);
	return activeFeatures;
}

function getCheckoutConfig() {
	return {
		backup: PRODUCT_JETPACK_BACKUP_T1_YEARLY,
		boost: PRODUCT_JETPACK_BOOST,
		search: PRODUCT_JETPACK_SEARCH,
		security: PLAN_JETPACK_SECURITY_T1_YEARLY,
		social: PRODUCT_JETPACK_SOCIAL_BASIC,
		video: PRODUCT_JETPACK_VIDEOPRESS,
	};
}

function getCheckoutUrls( siteSlug: string | null ) {
	if ( ! siteSlug ) {
		return {};
	}
	// TODO: Change URL to point at plugin installation within wp-admin.
	// ie: /wp-admin/update.php?action=install-plugin&plugin=plugin-name&_wpnonce=valid-nonce).
	const checkoutConfig = getCheckoutConfig();
	const checkoutURLs = Object.fromEntries(
		Object.entries( checkoutConfig ).map( ( [ key, value ] ) => [
			key,
			`${ CHECKOUT_URL_PREFIX }${ buildCheckoutURL( siteSlug, value, QUERY_VALUES ) }`,
		] )
	);
	return checkoutURLs;
}

// TODO: Remove local use-purchased-products.tsx file.

export default function JetpackUpsellSection() {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteFeatures = useSiteFeatures( siteId );

	if ( ! isOdysseyStats ) {
		return null;
	}

	// Build checkout URL prefixed with WordPress.com.
	const upgradeUrls = getCheckoutUrls( siteSlug );

	return (
		<div className="jetpack-upsell-section">
			<JetpackUpsellCard
				siteSlug={ siteSlug }
				siteFeatures={ siteFeatures }
				upgradeUrls={ upgradeUrls }
			/>
		</div>
	);
}
