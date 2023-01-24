import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get, reduce } from 'lodash';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import SectionHeader from 'calypso/components/section-header';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';

export const StatsReach = ( props ) => {
	const {
		translate,
		siteId,
		followData,
		publicizeData,
		isLoadingPublicize,
		siteSlug,
		isOdysseyStats,
	} = props;

	const isLoadingFollowData = ! followData;
	const wpcomFollowCount = get( followData, 'total_wpcom', 0 );
	const emailFollowCount = get( followData, 'total_email', 0 );
	const publicizeFollowCount = reduce(
		publicizeData,
		( sum, item ) => {
			return sum + item.value;
		},
		0
	);

	return (
		<div className="list-total-followers">
			{ siteId && <QuerySiteStats siteId={ siteId } statType="statsFollowers" /> }
			{ siteId && <QuerySiteStats siteId={ siteId } statType="statsPublicize" /> }
			<SectionHeader label={ translate( 'Follower totals' ) } />
			<Card className="stats-module stats-reach__card">
				<StatsTabs borderless>
					<StatsTab
						gridicon="my-sites"
						label={ translate( 'WordPress.com' ) }
						loading={ isLoadingFollowData }
						href={ ! isOdysseyStats ? `/people/followers/${ siteSlug }` : null }
						value={ wpcomFollowCount }
						compact
					/>
					<StatsTab
						gridicon="mail"
						label={ translate( 'Email' ) }
						loading={ isLoadingFollowData }
						href={ ! isOdysseyStats ? `/people/email-followers/${ siteSlug }` : null }
						value={ emailFollowCount }
						compact
					/>
					<StatsTab
						gridicon="share"
						label={ translate( 'Social' ) }
						loading={ isLoadingPublicize }
						value={ publicizeFollowCount }
						compact
					/>
				</StatsTabs>
			</Card>
		</div>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const followData = getSiteStatsNormalizedData( state, siteId, 'statsFollowers' );
	const publicizeData = getSiteStatsNormalizedData( state, siteId, 'statsPublicize' );
	const isLoadingPublicize =
		isRequestingSiteStatsForQuery( state, siteId, 'statsPublicize' ) && ! publicizeData.length;
	const siteSlug = getSiteSlug( state, siteId );

	return {
		siteId,
		followData,
		publicizeData,
		isLoadingPublicize,
		siteSlug,
		isOdysseyStats: config.isEnabled( 'is_running_in_jetpack_site' ),
	};
} )( localize( StatsReach ) );
