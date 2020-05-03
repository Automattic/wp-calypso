/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { pick } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import { withLocalizedMoment } from 'components/localized-moment';
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'state/stats/lists/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class StatsAllTime extends Component {
	static propTypes = {
		translate: PropTypes.func,
		siteId: PropTypes.number,
		requesting: PropTypes.bool,
		query: PropTypes.object,
		posts: PropTypes.number,
		views: PropTypes.number,
		viewsBestDay: PropTypes.string,
		viewsBestDayTotal: PropTypes.number,
	};

	render() {
		const {
			translate,
			siteId,
			requesting,
			posts,
			views,
			visitors,
			viewsBestDay,
			viewsBestDayTotal,
			query,
		} = this.props;
		const isLoading = requesting && ! views;

		let bestDay;

		if ( viewsBestDay && ! isLoading ) {
			bestDay = this.props.moment( viewsBestDay ).format( 'LL' );
		}

		const classes = {
			'is-loading': requesting,
		};

		return (
			<div>
				{ siteId && <QuerySiteStats siteId={ siteId } statType="stats" query={ query } /> }
				<SectionHeader label={ translate( 'All-time posts, views, and visitors' ) } />
				<Card className={ classNames( 'stats-module', 'all-time', classes ) }>
					<StatsTabs borderless>
						<StatsTab
							gridicon="posts"
							label={ translate( 'Posts' ) }
							loading={ isLoading }
							value={ posts }
							compact
						/>
						<StatsTab
							gridicon="visible"
							label={ translate( 'Views' ) }
							loading={ isLoading }
							value={ views }
							compact
						/>
						<StatsTab
							gridicon="user"
							label={ translate( 'Visitors' ) }
							loading={ isLoading }
							value={ visitors }
							compact
						/>
						<StatsTab
							className="all-time__is-best"
							gridicon="trophy"
							label={ translate( 'Best Views Ever' ) }
							loading={ isLoading }
							value={ viewsBestDayTotal }
							compact
						>
							<span className="all-time__best-day">{ bestDay }</span>
						</StatsTab>
					</StatsTabs>
				</Card>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const query = {};
	const allTimeData = getSiteStatsNormalizedData( state, siteId, 'stats', query ) || {};
	const allTimeStats = pick( allTimeData, [
		'posts',
		'views',
		'visitors',
		'viewsBestDay',
		'viewsBestDayTotal',
	] );

	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, 'stats', query ),
		query,
		siteId,
		...allTimeStats,
	};
} )( localize( withLocalizedMoment( StatsAllTime ) ) );
