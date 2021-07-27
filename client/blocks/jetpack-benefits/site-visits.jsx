/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import {
	getSiteStatsNormalizedData,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';

/**
 * Internal Dependencies
 */
import memoizeLast from 'calypso/lib/memoize-last';
import moment from 'moment';
import { JetpackBenefitsCard } from 'calypso/blocks/jetpack-benefits/benefit-card';

const memoizedQuery = memoizeLast( ( period, unit, quantity, endOf ) => ( {
	period,
	unit: unit,
	quantity: quantity,
	date: endOf,
} ) );

const today = moment().locale( 'en' );
const statType = 'statsVisits';
const period = 'year';
const query = memoizedQuery( period, 'month', 12, today.format( 'YYYY-MM-DD' ) );

/**
 * Show some basic site stats to illustrate the benefits of Jetpack
 */
class JetpackBenefitsSiteVisits extends React.Component {
	getTotalSiteVisits() {
		if ( this.props.requesting ) {
			return '...';
		}

		let countVisits = 0;
		this.props.data.map( ( monthPeriod ) => {
			countVisits += monthPeriod.views;
		} );

		return countVisits;
	}

	render() {
		const { siteId } = this.props;

		// load select stats for this site (primarily visitor count)
		// query the site stats here
		// shows within the context of a "benefits" card
		return (
			<React.Fragment>
				{ statType && siteId && (
					<QuerySiteStats siteId={ siteId } statType={ statType } query={ query } />
				) }

				<JetpackBenefitsCard
					headline="Site Stats"
					stat={ this.getTotalSiteVisits() }
					description="Visitors to your site tracked by Jetpack in the last year."
				/>
			</React.Fragment>
		);
	}
}

export default connect( ( state, { siteId } ) => {
	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, statType, query ),
		data: getSiteStatsNormalizedData( state, siteId, statType, query ),
	};
}, {} )( JetpackBenefitsSiteVisits );
