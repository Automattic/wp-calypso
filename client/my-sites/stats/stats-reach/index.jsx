import config from '@automattic/calypso-config';
import { Popover } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get, reduce } from 'lodash';
import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { getSiteSlug } from 'calypso/state/sites/selectors';
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
	} = props;

	const [ isPopoverVisible, setPopoverVisible ] = useState( false );
	const socialRef = useRef( null );

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

	let data = [];

	const wpData = {
		value: wpcomFollowCount,
		label: translate( 'WordPress.com' ),
	};

	const emailData = {
		value: emailFollowCount,
		label: translate( 'Email' ),
	};

	const socialData = {
		value: publicizeFollowCount,
		label: (
			<span
				ref={ socialRef }
				onMouseEnter={ () => setPopoverVisible( true ) }
				onMouseLeave={ () => setPopoverVisible( false ) }
			>
				{ translate( 'Social' ) }
			</span>
		),
	};

	if ( ! isOdysseyStats ) {
		wpData.actions = [
			{
				type: 'link',
				data: `/people/subscribers/${ siteSlug }`,
			},
		];

		emailData.actions = [
			{
				type: 'link',
				// default to subscribers because `/people/email-followers/${ siteSlug }`, is not available at the moment
				data: `/people/subscribers/${ siteSlug }`,
			},
		];
	}

	if ( publicizeFollowCount > 0 ) {
		socialData.children = publicizeData;
	}

	data = [ wpData, emailData, socialData ];

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

			<Popover
				className="tooltip tooltip--darker highlight-card-tooltip highlight-card__settings-tooltip"
				isVisible={ isPopoverVisible }
				position="bottom left"
				context={ socialRef.current }
			>
				<div className="highlight-card-tooltip-content">
					<p>{ translate( 'This represents the count of social media subscribers.' ) }</p>
				</div>
			</Popover>
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
	};
} )( localize( StatsReach ) );
