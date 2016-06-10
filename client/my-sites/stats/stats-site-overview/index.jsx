/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsForQuery
} from 'state/stats/lists/selectors';
import { getSiteSlug } from 'state/sites/selectors';

const StatsSiteOverview = React.createClass( {
	displayName: 'StatsSiteOverview',

	proptypes: {
		siteId: PropTypes.number,
		period: PropTypes.string,
		date: PropTypes.string,
		path: PropTypes.string.isRequired,
		query: PropTypes.object,
		requesting: PropTypes.bool,
		summaryData: PropTypes.object,
		insights: PropTypes.bool,
		title: PropTypes.string
	},

	isValueLow( value ) {
		return ! value || 0 === value;
	},

	render() {
		const { siteId, siteSlug, path, summaryData, query, title } = this.props;
		const { views, visitors, likes, comments } = summaryData;
		const siteStatsPath = [ path, siteSlug ].join( '/' );
		let headerPath = siteStatsPath;

		return (
			<div>
				{ siteId && <QuerySiteStats siteId={ siteId } statType="statsSummary" query={ query } /> }
				<SectionHeader label={ title } href={ headerPath } />
				<Card className="stats__overview stats-module is-site-overview">
					<StatsTabs borderless>
						<StatsTab
							className={ this.isValueLow( views ) ? 'is-low' : null }
							href={ siteStatsPath }
							gridicon="visible"
							label={ this.translate( 'Views', { context: 'noun' } ) }
							value={ views } />
						<StatsTab
							className={ this.isValueLow( visitors ) ? 'is-low' : null }
							href={ siteStatsPath + '?tab=visitors' }
							gridicon="user"
							label={ this.translate( 'Visitors', { context: 'noun' } ) }
							value={ visitors } />
						<StatsTab
							className={ this.isValueLow( likes ) ? 'is-low' : null }
							href={ siteStatsPath + '?tab=likes' }
							gridicon="star"
							label={ this.translate( 'Likes', { context: 'noun' } ) }
							value={ likes } />
						<StatsTab
							className={ this.isValueLow( comments ) ? 'is-low' : null }
							href={ siteStatsPath + '?tab=comments' }
							gridicon="comment"
							label={ this.translate( 'Comments', { context: 'noun' } ) }
							value={ comments } />
					</StatsTabs>
				</Card>
			</div>
		);
	}
} );

export default connect( ( state, ownProps ) => {
	const { siteId, date, period } = ownProps;
	const query = {
		date,
		period
	};

	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, 'statsSummary', query ),
		summaryData: getSiteStatsForQuery( state, siteId, 'statsSummary', query ) || {},
		siteSlug: getSiteSlug( state, siteId ),
		query
	};
} )( StatsSiteOverview );

