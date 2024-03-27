import config from '@automattic/calypso-config';
import version_compare from 'calypso/lib/version-compare';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';

/**
 * TODO: look at why it is not working for is_internal option, and remove the check here.
 */
const A8C_SPECIAL_BLOG_IDS = [
	9619154, //en.support.wordpress.com
	20115252, //jetpack.com
];

export const isA8CSpecialBlog = ( siteId: number | null ) =>
	A8C_SPECIAL_BLOG_IDS.includes( siteId ?? 0 );

const version_greater_than_or_equal = (
	version: string | null,
	compareVersion: string,
	isOdysseyStats = false
) => {
	return !! ( ! isOdysseyStats || ( version && version_compare( version, compareVersion, '>=' ) ) );
};

export default function getEnvStatsFeatureSupportChecks( state: object, siteId: number | null ) {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const statsAdminVersion = getJetpackStatsAdminVersion( state, siteId );
	const isSiteJetpackNotAtomic = isJetpackSite( state, siteId, {
		treatAtomicAsJetpackSite: false,
	} );

	return {
		supportsHighlightsSettings: version_greater_than_or_equal(
			statsAdminVersion,
			'0.9.0-alpha',
			isOdysseyStats
		),
		supportsNewStatsNotices: version_greater_than_or_equal(
			statsAdminVersion,
			'0.10.0-alpha',
			isOdysseyStats
		),
		supportsSubscriberChart: version_greater_than_or_equal(
			statsAdminVersion,
			'0.11.0-alpha',
			isOdysseyStats
		),
		supportsPlanUsage: version_greater_than_or_equal(
			statsAdminVersion,
			'0.15.0-alpha',
			isOdysseyStats
		),
		supportsEmailStats: version_greater_than_or_equal(
			statsAdminVersion,
			'0.16.0-alpha',
			isOdysseyStats
		),
		supportsUTMStats:
			// TODO: Make UTM stats available for internal Simple sites.
			isA8CSpecialBlog( siteId ) ||
			// TODO: Remove the flag check once UTM stats are released.
			( config.isEnabled( 'stats/utm-module' ) &&
				// UTM stats are only available for Jetpack sites for now.
				isSiteJetpackNotAtomic &&
				version_greater_than_or_equal( statsAdminVersion, '0.17.0-alpha', isOdysseyStats ) ),
		supportsOnDemandCommercialClassification: version_greater_than_or_equal(
			statsAdminVersion,
			'0.18.0-alpha',
			isOdysseyStats
		),
	};
}
