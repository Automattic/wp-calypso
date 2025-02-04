import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import { get, reduce } from 'lodash';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import isAtomicSite from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StatsListCard from '../stats-list/stats-list-card';
import StatsModulePlaceholder from '../stats-module/placeholder';

export const StatsReach = ( props ) => {
	const {
		translate,
		siteId,
		followData,
		publicizeData,
		isLoadingPublicize,
		siteSlug,
		isOdysseyStats,
		isJetpack,
		isAtomic,
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

	const wpData = {
		value: wpcomFollowCount,
		label: translate( 'WordPress.com' ),
	};

	const emailData = {
		value: emailFollowCount,
		label: translate( 'Email' ),
	};

	const data = [ wpData, emailData ];

	if ( ! isOdysseyStats ) {
		const subscribersUrl =
			isAtomic || isJetpack
				? `https://cloud.jetpack.com/subscribers/${ siteSlug }`
				: `/people/subscribers/${ siteSlug }`;

		wpData.actions = [
			{
				type: 'link',
				data: subscribersUrl,
			},
		];

		emailData.actions = [
			{
				type: 'link',
				// default to subscribers because `/people/email-followers/${ siteSlug }`, is not available at the moment
				data: subscribersUrl,
			},
		];
	}

	if ( publicizeFollowCount > 0 ) {
		data.push( ...publicizeData ); // Spread the publicizeData into the data array if there are any publicize followers
	}

	// sort descending
	data.sort( ( a, b ) => b.value - a.value );

	return (
		<>
			{ siteId && <QuerySiteStats siteId={ siteId } statType="statsFollowers" /> }
			{ siteId && <QuerySiteStats siteId={ siteId } statType="statsPublicize" /> }
			<StatsListCard
				moduleType="publicize"
				data={ data }
				title={ translate( 'Number of Subscribers' ) }
				emptyMessage={ translate( 'No subscribers recorded' ) }
				mainItemLabel=""
				metricLabel=""
				splitHeader
				useShortNumber
				// Shares don't have a summary page yet.
				// TODO: limit to 5 items after summary page is added.
				// showMore={ ... }
				// TODO: add error state once it's implemented
				loader={
					( isLoadingFollowData || isLoadingPublicize ) && (
						<StatsModulePlaceholder isLoading={ isLoadingFollowData } />
					)
				}
			/>
		</>
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
		isAtomic: isAtomicSite( state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
	};
} )( localize( StatsReach ) );
