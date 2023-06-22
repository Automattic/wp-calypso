import { useSelector } from 'react-redux';
import version_compare from 'calypso/lib/version-compare';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';
import LegacyStatsNotices from './legacy-notices';
import NewStatsNotices from './notices';

import './style.scss';

/**
 * Return new or old StatsNotices components based on env.
 */
export default function StatsNotices( { siteId, isOdysseyStats } ) {
	const statsAdminVersion = useSelector( ( state ) =>
		getJetpackStatsAdminVersion( state, siteId )
	);
	const supportNewStatsNotices =
		! isOdysseyStats ||
		!! ( statsAdminVersion && version_compare( statsAdminVersion, '0.10.0-alpha', '>=' ) );

	return supportNewStatsNotices ? (
		<NewStatsNotices siteId={ siteId } isOdysseyStats={ isOdysseyStats } />
	) : (
		<LegacyStatsNotices siteId={ siteId } />
	);
}
