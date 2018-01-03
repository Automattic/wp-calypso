/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import StatsModulePlaceholder from 'my-sites/stats/stats-module/placeholder';
import ErrorPanel from 'my-sites/stats/stats-error';

class AnnualSiteStats extends Component {
	static propTypes = {
		requesting: PropTypes.bool,
		years: PropTypes.array,
		translate: PropTypes.func,
		numberFormat: PropTypes.func,
		moment: PropTypes.func,
	};

	renderContent( data ) {
		const { translate, numberFormat } = this.props;
		return (
			<div className="annual-site-stats__content">
				<div className="annual-site-stats__stat is-year">
					<div className="annual-site-stats__stat-title">{ translate( 'year' ) }</div>
					<div className="annual-site-stats__stat-figure is-large">{ data.year }</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">{ translate( 'total posts' ) }</div>
					<div className="annual-site-stats__stat-figure is-large">
						{ numberFormat( data.total_posts ) }
					</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">{ translate( 'total comments' ) }</div>
					<div className="annual-site-stats__stat-figure">
						{ numberFormat( data.total_comments ) }
					</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">
						{ translate( 'avg comments per post' ) }
					</div>
					<div className="annual-site-stats__stat-figure">
						{ numberFormat( data.avg_comments ) }
					</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">{ translate( 'total likes' ) }</div>
					<div className="annual-site-stats__stat-figure">{ numberFormat( data.total_likes ) }</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">{ translate( 'avg likes per post' ) }</div>
					<div className="annual-site-stats__stat-figure">{ numberFormat( data.avg_likes ) }</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">{ translate( 'total words' ) }</div>
					<div className="annual-site-stats__stat-figure">{ numberFormat( data.total_words ) }</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">{ translate( 'avg words per post' ) }</div>
					<div className="annual-site-stats__stat-figure">{ numberFormat( data.avg_words ) }</div>
				</div>
			</div>
		);
	}

	render() {
		const { years, translate, moment } = this.props;
		const now = moment();
		const currentYear = now.format( 'YYYY' );
		let previousYear = null;
		if ( now.month() === 0 ) {
			previousYear = now.subtract( 1, 'months' ).format( 'YYYY' );
		}
		const currentYearData = years && find( years, y => y.year === currentYear );
		const previousYearData = previousYear && years && find( years, y => y.year === previousYear );
		const isLoading = ! years;
		const isError = ! isLoading && years.errors;
		const noData = ! isLoading && ! isError && ! ( currentYearData || previousYearData );
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div>
				<SectionHeader label={ translate( 'Annual Site Stats', { args: [ currentYear ] } ) } />
				<Card className="stats-module">
					<StatsModulePlaceholder isLoading={ isLoading } />
					{ isError && <ErrorPanel message={ translate( 'Oops! Something went wrong.' ) } /> }
					{ noData && (
						<ErrorPanel message={ translate( 'No annual stats recorded for this year' ) } />
					) }
					{ currentYearData && this.renderContent( currentYearData ) }
					{ previousYearData && this.renderContent( previousYearData ) }
				</Card>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( state => {
	const statType = 'statsInsights';
	const siteId = getSelectedSiteId( state );
	const insights = getSiteStatsNormalizedData( state, siteId, statType, {} );

	return {
		years: insights.years,
	};
} )( localize( AnnualSiteStats ) );
