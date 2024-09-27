import { localize } from 'i18n-calypso';
import { values } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import compareProps from 'calypso/lib/compare-props';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { getSiteStatsPostStreakData } from 'calypso/state/stats/lists/selectors';
import StatsHeatMapLegend from '../../stats-heap-map/legend';
import Month from './month';

import './style.scss';

class PostingActivitySection extends Component {
	static displayName = 'PostingActivitySection';

	static propTypes = {
		siteId: PropTypes.number,
		query: PropTypes.object,
	};

	getMonthComponents = () => {
		const { streakData } = this.props;
		// Compute maximum per-day post count from the streakData. It's used to scale the chart.
		const maxPosts = Math.max( ...values( streakData ) );
		const months = [];

		for ( let i = 11; i >= 0; i-- ) {
			const startDate = this.props.moment().subtract( i, 'months' ).startOf( 'month' );
			months.push(
				<Month key={ i } startDate={ startDate } streakData={ streakData } max={ maxPosts } />
			);
		}

		return months;
	};

	render() {
		const { siteId, query, translate } = this.props;

		/* eslint-disable jsx-a11y/click-events-have-key-events, wpcalypso/jsx-classname-namespace */
		return (
			<div className="post-trends">
				{ siteId && <QuerySiteStats siteId={ siteId } statType="statsStreak" query={ query } /> }

				<div className="post-trends__heading">
					<h3 className="post-trends__title">{ translate( 'Posting activity' ) }</h3>
				</div>
				<div ref={ this.wrapperRef } className="post-trends__wrapper">
					<div ref={ this.yearRef } className="post-trends__year">
						{ this.getMonthComponents() }
					</div>

					<StatsHeatMapLegend
						labelFewer={ translate( 'Fewer Posts', {
							context: 'Legend label in stats post trends visualization',
						} ) }
						labelMore={ translate( 'More Posts', {
							context: 'Legend label in stats post trends visualization',
						} ) }
					/>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => {
	const query = {
		startDate: moment()
			.locale( 'en' )
			.subtract( 1, 'year' )
			.startOf( 'month' )
			.format( 'YYYY-MM-DD' ),
		endDate: moment().locale( 'en' ).endOf( 'month' ).format( 'YYYY-MM-DD' ),
		gmtOffset: getSiteOption( state, siteId, 'gmt_offset' ),
		max: 3000,
	};

	return {
		streakData: getSiteStatsPostStreakData( state, siteId, query ),
		query,
	};
};

export default connect( mapStateToProps, null, null, {
	areStatePropsEqual: compareProps( { deep: [ 'query' ] } ),
} )( localize( withLocalizedMoment( PostingActivitySection ) ) );
