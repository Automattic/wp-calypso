/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import SectionHeader from 'components/section-header';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import StatsModulePlaceholder from 'my-sites/stats/stats-module/placeholder';
import ErrorPanel from 'my-sites/stats/stats-error';
import QuerySiteStats from 'components/data/query-site-stats';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

class AnnualSiteStats extends Component {
	static propTypes = {
		requesting: PropTypes.bool,
		years: PropTypes.array,
		translate: PropTypes.func,
		numberFormat: PropTypes.func,
		moment: PropTypes.func,
		isWidget: PropTypes.bool,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
	};

	static defaultProps = {
		isWidget: false,
	};

	renderWidgetContent( data, strings ) {
		const { numberFormat } = this.props;
		return (
			<div className="annual-site-stats__content">
				<div className="annual-site-stats__stat is-year">
					<div className="annual-site-stats__stat-title">{ strings.year }</div>
					<div className="annual-site-stats__stat-figure is-large">{ data.year }</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">{ strings.total_posts }</div>
					<div className="annual-site-stats__stat-figure is-large">
						{ numberFormat( data.total_posts ) }
					</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">{ strings.total_comments }</div>
					<div className="annual-site-stats__stat-figure">
						{ numberFormat( data.total_comments ) }
					</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">{ strings.avg_comments }</div>
					<div className="annual-site-stats__stat-figure">
						{ numberFormat( data.avg_comments ) }
					</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">{ strings.total_likes }</div>
					<div className="annual-site-stats__stat-figure">{ numberFormat( data.total_likes ) }</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">{ strings.avg_likes }</div>
					<div className="annual-site-stats__stat-figure">{ numberFormat( data.avg_likes ) }</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">{ strings.total_words }</div>
					<div className="annual-site-stats__stat-figure">{ numberFormat( data.total_words ) }</div>
				</div>
				<div className="annual-site-stats__stat">
					<div className="annual-site-stats__stat-title">{ strings.avg_words }</div>
					<div className="annual-site-stats__stat-figure">{ numberFormat( data.avg_words ) }</div>
				</div>
			</div>
		);
	}

	formatTableValue( key, value ) {
		const { numberFormat } = this.props;
		const singleDecimal = [ 'avg_comments', 'avg_likes' ];
		if ( includes( singleDecimal, key ) ) {
			return numberFormat( value, 1 );
		}
		if ( 'year' === key ) {
			return value;
		}
		return numberFormat( value );
	}

	renderTable( data, strings ) {
		const keys = Object.keys( strings );
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="module-content-table is-fixed-row-header">
				<div className="module-content-table-scroll">
					<table cellPadding="0" cellSpacing="0">
						<thead>
							<tr>
								{ keys.map( ( key ) => (
									<th scope="col" key={ key }>
										{ strings[ key ] }
									</th>
								) ) }
							</tr>
						</thead>
						<tbody>
							{ data.map( ( row, i ) => (
								<tr key={ i }>
									{ keys.map( ( key, j ) => {
										const Cell = j === 0 ? 'th' : 'td';
										return (
											<Cell scope={ j === 0 ? 'row' : null } key={ j }>
												{ this.formatTableValue( key, row[ key ] ) }
											</Cell>
										);
									} ) }
								</tr>
							) ) }
						</tbody>
					</table>
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	getStrings() {
		const { translate } = this.props;
		return {
			year: translate( 'Year' ),
			total_posts: translate( 'Total Posts' ),
			total_comments: translate( 'Total Comments' ),
			avg_comments: translate( 'Avg Comments per Post' ),
			total_likes: translate( 'Total Likes' ),
			avg_likes: translate( 'Avg Likes per Post' ),
			total_words: translate( 'Total Words' ),
			avg_words: translate( 'Avg Words per Post' ),
		};
	}

	render() {
		const { years, translate, moment, isWidget, siteId, siteSlug } = this.props;
		const strings = this.getStrings();
		const now = moment();
		const currentYear = now.format( 'YYYY' );
		let previousYear = null;
		if ( now.month() === 0 ) {
			previousYear = now.subtract( 1, 'months' ).format( 'YYYY' );
		}
		const currentYearData = years && find( years, ( y ) => y.year === currentYear );
		const previousYearData =
			previousYear && years && find( years, ( y ) => y.year === previousYear );
		const isLoading = ! years;
		const isError = ! isLoading && years.errors;
		const hasData = isWidget ? currentYearData || previousYearData : years;
		const noData = ! isLoading && ! isError && ! hasData;
		const noDataMsg = isWidget
			? translate( 'No annual stats recorded for this year' )
			: translate( 'No annual stats recorded' );
		const viewAllLink = `/stats/annualstats/${ siteSlug }`;
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div>
				{ ! isWidget && siteId && <QuerySiteStats siteId={ siteId } statType="statsInsights" /> }
				{ isWidget && (
					<SectionHeader
						href={ viewAllLink }
						label={ translate( 'Annual Site Stats', { args: [ currentYear ] } ) }
					/>
				) }
				<Card className="stats-module">
					<StatsModulePlaceholder isLoading={ isLoading } />
					{ isError && <ErrorPanel message={ translate( 'Oops! Something went wrong.' ) } /> }
					{ noData && <ErrorPanel message={ noDataMsg } /> }
					{ isWidget && currentYearData && this.renderWidgetContent( currentYearData, strings ) }
					{ isWidget && previousYearData && this.renderWidgetContent( previousYearData, strings ) }
					{ ! isWidget && years && this.renderTable( years, strings ) }
					{ isWidget && years && years.length !== 0 && (
						<div className="module-expand">
							<a href={ viewAllLink }>
								{ translate( 'View All', { context: 'Stats: Button label to expand a panel' } ) }
								<span className="right" />
							</a>
						</div>
					) }
				</Card>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( ( state ) => {
	const statType = 'statsInsights';
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	const insights = getSiteStatsNormalizedData( state, siteId, statType, {} );

	return {
		years: insights.years,
		siteId,
		siteSlug,
	};
} )( localize( withLocalizedMoment( AnnualSiteStats ) ) );
