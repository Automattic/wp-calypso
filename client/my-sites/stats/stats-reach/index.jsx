/**
 * External dependencies
 */

import React from 'react';
import { connect } from 'react-redux';
import { get, reduce } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'state/stats/lists/selectors';

export const StatsReach = ( props ) => {
	const { translate, siteId, followData, publicizeData, isLoadingPublicize, siteSlug } = props;

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
		<div>
			{ siteId && <QuerySiteStats siteId={ siteId } statType="statsFollowers" /> }
			{ siteId && <QuerySiteStats siteId={ siteId } statType="statsPublicize" /> }
			<SectionHeader label={ translate( 'Follower Totals' ) } />
			<Card className="stats-module stats-reach__card">
				<StatsTabs borderless>
					<StatsTab
						gridicon="my-sites"
						label={ translate( 'WordPress.com' ) }
						loading={ isLoadingFollowData }
						href={ `/people/followers/${ siteSlug }` }
						value={ wpcomFollowCount }
						compact
					/>
					<StatsTab
						gridicon="mail"
						label={ translate( 'Email' ) }
						loading={ isLoadingFollowData }
						href={ `/people/email-followers/${ siteSlug }` }
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
	};
} )( localize( StatsReach ) );
