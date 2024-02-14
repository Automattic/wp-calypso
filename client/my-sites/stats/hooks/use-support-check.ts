import config from '@automattic/calypso-config';
import version_compare from 'calypso/lib/version-compare';
import { useSelector } from 'calypso/state';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';

export default function useSupportChecks( siteId: number | null ) {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const statsAdminVersion = useSelector( ( state: object ) =>
		getJetpackStatsAdminVersion( state, siteId )
	);
	const supportEmailStats = !! (
		! isOdysseyStats ||
		( statsAdminVersion && version_compare( statsAdminVersion, '0.15.0-alpha', '>=' ) )
	); // TODO: change the version to the version which supports the email APIs!

	return {
		supportEmailStats,
	};
}
