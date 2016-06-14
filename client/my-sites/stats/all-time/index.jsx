/**
* External dependencies
*/
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import User from 'lib/user';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsForQuery
} from 'state/stats/lists/selectors';

const user = User();

const StatsAllTime = React.createClass( {
	mixins: [ PureRenderMixin ],

	propTypes: {
		siteId: PropTypes.number,
		requesting: PropTypes.bool,
		query: PropTypes.object,
		posts: PropTypes.number,
		views: PropTypes.number,
		views_best_day: PropTypes.string,
		views_best_day_total: PropTypes.number
	},

	render() {
		const {
			siteId,
			requesting,
			posts,
			views,
			visitors,
			views_best_day,
			views_best_day_total,
			query
		} = this.props;
		const isLoading = requesting && ! views;

		let bestDay;

		if ( views_best_day && ! isLoading ) {
			bestDay = this.moment( views_best_day ).format( 'LL' );
		}

		const classes = {
			'is-loading': requesting,
			'is-non-en': user.data.localeSlug && ( user.data.localeSlug !== 'en' )
		};

		return (
			<div>
				{ siteId && <QuerySiteStats siteId={ siteId } statType="stats" query={ query } /> }
				<SectionHeader label={ this.translate( 'All-time posts, views, and visitors' ) }></SectionHeader>
				<Card className={ classNames( 'stats-module', 'stats-all-time', classes ) }>
					<div className="module-content">
						<StatsTabs borderless>
							<StatsTab
								gridicon="posts"
								label={ this.translate( 'Posts' ) }
								loading={ isLoading }
								value={ posts } />
							<StatsTab
								gridicon="visible"
								label={ this.translate( 'Views' ) }
								loading={ isLoading }
								value={ views } />
							<StatsTab
								gridicon="user"
								label={ this.translate( 'Visitors' ) }
								loading={ isLoading }
								value={ visitors } />
							<StatsTab
								className="is-best"
								gridicon="trophy"
								label={ this.translate( 'Best Views Ever' ) }
								loading={ isLoading }
								value={ views_best_day_total }>
								<span className="stats-all-time__best-day">{ bestDay }</span>
							</StatsTab>
						</StatsTabs>
					</div>
				</Card>
			</div>
		);
	}
} );

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const query = {};
	const allTimeData = getSiteStatsForQuery( state, siteId, 'stats', query ) || { stats: {} };
	const {
		posts,
		views,
		visitors,
		views_best_day,
		views_best_day_total
	} = allTimeData.stats;

	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, 'stats', query ),
		query,
		siteId,
		posts,
		views,
		visitors,
		views_best_day,
		views_best_day_total
	};
} )( StatsAllTime );
