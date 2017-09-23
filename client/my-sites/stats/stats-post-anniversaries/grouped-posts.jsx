/**
 * External dependencies
 */
import React from 'react';
import { localize, moment } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import StatsContentText from '../stats-module/content-text';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

const label = ( translate, period ) => {
	if ( period.period === 'day' ) {
		return translate( 'Published on this day in the past:', {
			comment: 'Preceding a list of posts published in the previous years',
		} );
	}
	if ( period.period === 'week' ) {
		return translate( 'Published on this week in the past:', {
			comment: 'Preceding a list of posts published in the previous years',
		} );
	}
	if ( period.period === 'month' ) {
		return translate( 'Published on this month in the past:', {
			comment: 'Preceding a list of posts published in the previous years',
		} );
	}
	return '';
};

// Converts posts to the data format expected by StatsList.
const statsListData = ( postsByYear, siteSlug ) =>
	postsByYear.reduce(
		( allPosts, posts, i ) =>
			allPosts.concat(
				posts.map( post => ( {
					page: `/stats/post/${ post.ID }/${ siteSlug }`,
					actions: [ { type: 'link', data: post.URL } ],
					label: post.title,
					value: {
						type: 'raw',
						value: moment().subtract( i + 1, 'years' ).format( 'YYYY' ),
					},
				} ) ),
			),
		[],
	);

const GroupedPosts = ( { translate, postsByYear, summary, period, siteSlug } ) =>
	<div>
		<StatsContentText>
			{ ! summary &&
				<p>
					{ label( translate, period ) }
				</p> }
		</StatsContentText>
		<StatsListLegend label={ translate( 'Title' ) } value={ translate( 'Year' ) } />
		<StatsList moduleName={ 'postAnniversaries' } data={ statsListData( postsByYear, siteSlug ) } />
	</div>;

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );

	return {
		siteSlug,
	};
} )( localize( GroupedPosts ) );
