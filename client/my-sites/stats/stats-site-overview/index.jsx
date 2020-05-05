/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import StatsTabs from '../stats-tabs';
import StatsTab from '../stats-tabs/tab';
import SectionHeader from 'components/section-header';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSiteStatsForQuery } from 'state/stats/lists/selectors';
import { getSiteSlug } from 'state/sites/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class StatsSiteOverview extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		period: PropTypes.string,
		date: PropTypes.string,
		path: PropTypes.string.isRequired,
		query: PropTypes.object,
		summaryData: PropTypes.object,
		insights: PropTypes.bool,
		title: PropTypes.string,
	};

	isValueLow = ( value ) => {
		return ! value || 0 === value;
	};

	render() {
		const { siteId, siteSlug, path, summaryData, query, title } = this.props;
		const { views, visitors, likes, comments } = summaryData;
		const siteStatsPath = [ path, siteSlug ].join( '/' );
		const headerPath = siteStatsPath;

		/* eslint-disable wpcalypso/jsx-classname-namespace*/
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
							label={ this.props.translate( 'Views', { context: 'noun' } ) }
							value={ views }
						/>
						<StatsTab
							className={ this.isValueLow( visitors ) ? 'is-low' : null }
							href={ siteStatsPath + '?tab=visitors' }
							gridicon="user"
							label={ this.props.translate( 'Visitors', { context: 'noun' } ) }
							value={ visitors }
						/>
						<StatsTab
							className={ this.isValueLow( likes ) ? 'is-low' : null }
							href={ siteStatsPath + '?tab=likes' }
							gridicon="star"
							label={ this.props.translate( 'Likes', { context: 'noun' } ) }
							value={ likes }
						/>
						<StatsTab
							className={ this.isValueLow( comments ) ? 'is-low' : null }
							href={ siteStatsPath + '?tab=comments' }
							gridicon="comment"
							label={ this.props.translate( 'Comments', { context: 'noun' } ) }
							value={ comments }
						/>
					</StatsTabs>
				</Card>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const { siteId, date, period, siteSlug } = ownProps;
	const query = {
		date,
		period,
	};
	// It seems not all sites are in the sites/items subtree consistently
	const slug = getSiteSlug( state, siteId ) || siteSlug;

	return {
		summaryData: getSiteStatsForQuery( state, siteId, 'statsSummary', query ) || {},
		siteSlug: slug,
		query,
	};
} )( localize( StatsSiteOverview ) );
