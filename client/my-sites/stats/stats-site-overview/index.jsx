import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SectionHeader from 'calypso/components/section-header';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSiteStatsForQuery } from 'calypso/state/stats/lists/selectors';
import StatsTabs from '../components/stats-tabs';
import StatsTab from '../components/stats-tabs/tab';

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
		const { siteSlug, path, summaryData, title } = this.props;
		const { views, visitors, likes, comments } = summaryData;
		const siteStatsPath = [ path, siteSlug ].join( '/' );
		const headerPath = siteStatsPath;

		/* eslint-disable wpcalypso/jsx-classname-namespace*/
		return (
			<div>
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
