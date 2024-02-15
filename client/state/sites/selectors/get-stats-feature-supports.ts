import config from '@automattic/calypso-config';
import version_compare from 'calypso/lib/version-compare';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';

export default function getStatsFeatureSupportChecks( state: object, siteId: number | null ) {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const statsAdminVersion = getJetpackStatsAdminVersion( state, siteId );

	const supportEmailStats = !! (
		! isOdysseyStats ||
		( statsAdminVersion && version_compare( statsAdminVersion, '0.15.0-alpha', '>=' ) )
	); // TODO: change the version to the version which supports the email APIs!

	const supportSubscriberChart =
		! isOdysseyStats ||
		( statsAdminVersion && version_compare( statsAdminVersion, '0.11.0-alpha', '>=' ) );

	return {
		supportEmailStats,
		supportSubscriberChart,
	};
}
