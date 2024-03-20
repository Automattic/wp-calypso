import config from '@automattic/calypso-config';
import version_compare from 'calypso/lib/version-compare';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';

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
	const isSiteJetpack = isJetpackSite( state, siteId );

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
			// UTM stats are only available for Jetpack and Atomic sites for now.
			isSiteJetpack &&
			version_greater_than_or_equal( statsAdminVersion, '0.17.0-alpha', isOdysseyStats ),
	};
}
