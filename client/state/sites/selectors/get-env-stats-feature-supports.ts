import config from '@automattic/calypso-config';
import { createSelector } from '@automattic/state-utils';
import version_compare from 'calypso/lib/version-compare';
import { getJetpackVersion } from 'calypso/state/sites/selectors';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';

const version_greater_than_or_equal = (
	version: string | null,
	compareVersion: string,
	isOdysseyStats = false
) => {
	return !! ( ! isOdysseyStats || ( version && version_compare( version, compareVersion, '>=' ) ) );
};

function getEnvStatsFeatureSupportChecks( state: object, siteId: number | null ) {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const statsAdminVersion = getJetpackStatsAdminVersion( state, siteId );
	const jetpackVersion = getJetpackVersion( state, siteId );

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
		// Deprecating and is replaced with `isOldJetpack`.
		supportsUTMStats: ! isOdysseyStats || !! statsAdminVersion,
		// Deprecating and is replaced with `isOldJetpack`.
		supportsDevicesStats: ! isOdysseyStats || !! statsAdminVersion,
		supportsOnDemandCommercialClassification: version_greater_than_or_equal(
			statsAdminVersion,
			'0.18.0-alpha',
			isOdysseyStats
		),
		supportUserFeedback: version_greater_than_or_equal(
			statsAdminVersion,
			'0.22.0',
			isOdysseyStats
		),
		supportsLocationsStats: version_greater_than_or_equal(
			statsAdminVersion,
			'0.24.0',
			isOdysseyStats
		),
		shouldUseStatsBuiltInPurchasesApi: version_greater_than_or_equal(
			statsAdminVersion,
			'0.21.0-alpha',
			isOdysseyStats
		),
		supportsWpcomV3Jitm: version_greater_than_or_equal( jetpackVersion, '14.5', isOdysseyStats ),
		// TODO: Update the version check for the real number of Odyssey Stats v2.
		isOldJetpack: ! version_greater_than_or_equal( jetpackVersion, '14.6', isOdysseyStats ),
	};
}

const getEnvStatsFeatureSupportChecksMemoized = createSelector(
	getEnvStatsFeatureSupportChecks,
	( state, siteId ) => [
		getJetpackStatsAdminVersion( state, siteId ),
		config.isEnabled( 'is_running_in_jetpack_site' ),
		getJetpackVersion( state, siteId ),
	]
);

export default getEnvStatsFeatureSupportChecksMemoized;
