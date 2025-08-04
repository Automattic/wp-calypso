import { __ } from '@wordpress/i18n';
import {
	chartBar,
	cloud,
	megaphone,
	next,
	removeBug,
	search,
	shield,
	video,
} from '@wordpress/icons';
import { DotcomPlans, JetpackFeatures } from '../data/constants';
import { hasPlanFeature } from '../utils/site-features';
import type { Site } from '../data/types';

export const JETPACK_PRODUCTS = [
	{
		id: JetpackFeatures.STATS,
		icon: chartBar,
		label: __( 'Jetpack Stats' ),
		description: __( 'Clear, concise, and actionable analysis of your site performance.' ),
	},
	{
		id: JetpackFeatures.BACKUPS,
		icon: cloud,
		label: __( 'Jetpack VaultPress Backup' ),
		description: __(
			'Real-time backups save every change, and one-click restores get you back online quickly.'
		),
	},
	{
		id: JetpackFeatures.SOCIAL_ENHANCED_PUBLISHING,
		icon: megaphone,
		label: __( 'Jetpack Social' ),
		description: __(
			'Auto‑share your posts to social networks and track engagement in one place.'
		),
	},
	{
		id: JetpackFeatures.CLOUD_CRITICAL_CSS,
		icon: next,
		label: __( 'Jetpack Boost' ),
		description: __( 'Improves your site speed and performance.' ),
	},
	{
		id: JetpackFeatures.ANTISPAM,
		icon: removeBug,
		label: __( 'Akismet Anti-spam' ),
		description: __( 'Automatically clear spam from comments and forms.' ),
	},
	{
		id: JetpackFeatures.SEARCH,
		icon: search,
		label: __( 'Jetpack Search' ),
		description: __( 'Instantly deliver the most relevant results to your visitors.' ),
	},
	{
		id: JetpackFeatures.SCAN,
		icon: shield,
		label: __( 'Jetpack Scan' ),
		description: __( 'Guard against malware and bad actors 24/7.' ),
	},
	{
		id: JetpackFeatures.VIDEOPRESS,
		icon: video,
		label: __( 'Jetpack VideoPress' ),
		description: __( 'Powerful and flexible video hosting.' ),
	},
];

export function getJetpackProductsForSite( site: Site ) {
	return JETPACK_PRODUCTS.filter( ( product ) =>
		hasPlanFeature( site, product.id as JetpackFeatures )
	);
}

export function getSitePlanDisplayName( site: Site ) {
	if ( site.is_wpcom_staging_site ) {
		return __( 'Staging site' );
	}

	if ( site.plan?.product_slug === DotcomPlans.JETPACK_FREE ) {
		const products = getJetpackProductsForSite( site );
		if ( products.length === 1 ) {
			return products[ 0 ].label;
		}
		if ( products.length > 1 ) {
			return __( 'Jetpack' );
		}
	}

	return site.plan?.product_name || site.plan?.product_name_short || '';
}
