import { useSelector } from 'react-redux';
import version_compare from 'calypso/lib/version-compare';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';
import FeedbackNotice from './feedback-notice';
import LegacyStatsNotices from './legacy-notices';
import OptOutNotice from './opt-out-notice';
import { StatsNoticesProps } from './types';

import './style.scss';

/**
 * New notices aim to support Calypso and Odyssey stats.
 * New notices are based on async API call and hence is faster than the old notices.
 */
const NewStatsNotices = ( { siteId, isOdysseyStats }: StatsNoticesProps ) => {
	return (
		<>
			{ isOdysseyStats && <OptOutNotice siteId={ siteId } /> }
			{ isOdysseyStats && <FeedbackNotice siteId={ siteId } /> }
		</>
	);
};

/**
 * Return new or old StatsNotices components based on env.
 */
export default function StatsNotices( { siteId, isOdysseyStats }: StatsNoticesProps ) {
	const statsAdminVersion = useSelector( ( state: object ) =>
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
