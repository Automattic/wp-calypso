/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { flowRight, get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Tooltip from 'components/tooltip';
import { getSiteStatsQueryDate } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isRequestingSiteStatsForQuery } from 'state/stats/lists/selectors';
import { isAutoRefreshAllowedForQuery } from 'state/stats/lists/utils';

class StatsDatePicker extends Component {
	static propTypes = {
		date: PropTypes.oneOfType( [ PropTypes.object.isRequired, PropTypes.string.isRequired ] ),
		period: PropTypes.string.isRequired,
		summary: PropTypes.bool,
		query: PropTypes.object,
		statType: PropTypes.string,
		isActivity: PropTypes.bool,
		showQueryDate: PropTypes.bool,
	};

	static defaultProps = {
		showQueryDate: false,
		isActivity: false,
	};

	state = {
		isTooltipVisible: false,
	};

	showTooltip = () => {
		this.setState( { isTooltipVisible: true } );
	};

	hideTooltip = () => {
		this.setState( { isTooltipVisible: false } );
	};

	dateForSummarize() {
		const { query, moment, translate } = this.props;
		const localizedDate = moment();

		switch ( query.num ) {
			case '-1':
				return translate( 'All Time' );

			default:
				return translate( '%(number)s days ending %(endDate)s (Summarized)', {
					context: 'Date range for which stats are being displayed',
					args: {
						// LL is a date localized by momentjs
						number: parseInt( query.num ),
						endDate: localizedDate.format( 'LL' ),
					},
				} );
		}
	}

	dateForDisplay() {
		const { date, moment, period, translate } = this.props;

		// Ensure we have a moment instance here to work with.
		const momentDate = moment.isMoment( date ) ? date : moment( date );
		const localizedDate = moment( momentDate.format( 'YYYY-MM-DD' ) );
		let formattedDate;

		switch ( period ) {
			case 'week':
				formattedDate = translate( '%(startDate)s - %(endDate)s', {
					context: 'Date range for which stats are being displayed',
					args: {
						// LL is a date localized by momentjs
						startDate: localizedDate
							.startOf( 'week' )
							.add( 1, 'd' )
							.format( 'LL' ),
						endDate: localizedDate
							.endOf( 'week' )
							.add( 1, 'd' )
							.format( 'LL' ),
					},
				} );
				break;

			case 'month':
				formattedDate = localizedDate.format( 'MMMM YYYY' );
				break;

			case 'year':
				formattedDate = localizedDate.format( 'YYYY' );
				break;

			default:
				// LL is a date localized by momentjs
				formattedDate = localizedDate.format( 'LL' );
		}

		return formattedDate;
	}

	renderQueryDate() {
		const { queryDate, moment, translate } = this.props;
		if ( ! queryDate ) {
			return null;
		}

		const today = moment();
		const date = moment( queryDate );
		const isToday = today.isSame( date, 'day' );
		return (
			<span>
				{ translate( 'Last update: %(time)s', {
					args: { time: isToday ? date.format( 'LT' ) : date.fromNow() },
				} ) }
				<Gridicon icon="info-outline" size={ 18 } />
			</span>
		);
	}

	bindStatusIndicator = ref => {
		this.statusIndicator = ref;
	};

	render() {
		const { summary, translate, query, showQueryDate, isActivity } = this.props;
		const isSummarizeQuery = get( query, 'summarize' );

		const sectionTitle = isActivity
			? translate( 'Activity for {{period/}}', {
					components: {
						period: (
							<span className="period">
								<span className="date">
									{ isSummarizeQuery ? this.dateForSummarize() : this.dateForDisplay() }
								</span>
							</span>
						),
					},
					comment: 'Example: "Activity for December 2017"',
				} )
			: translate( 'Stats for {{period/}}', {
					components: {
						period: (
							<span className="period">
								<span className="date">
									{ isSummarizeQuery ? this.dateForSummarize() : this.dateForDisplay() }
								</span>
							</span>
						),
					},
					context: 'Stats: Main stats page heading',
					comment:
						'Example: "Stats for December 7", "Stats for December 8 - December 14", "Stats for December", "Stats for 2014"',
				} );

		return (
			<div>
				{ summary ? (
					<span>{ sectionTitle }</span>
				) : (
					<div className="stats-section-title">
						<h3>{ sectionTitle }</h3>
						{ showQueryDate &&
							isAutoRefreshAllowedForQuery( query ) && (
								<div
									className="stats-date-picker__refresh-status"
									ref={ this.bindStatusIndicator }
									onMouseEnter={ this.showTooltip }
									onMouseLeave={ this.hideTooltip }
								>
									<span className="stats-date-picker__update-date">
										{ this.renderQueryDate() }
										<Tooltip
											isVisible={ this.state.isTooltipVisible }
											onClose={ this.hideTooltip }
											position="bottom"
											context={ this.statusIndicator }
										>
											{ translate( 'Auto-refreshing every 3 minutes' ) }
										</Tooltip>
									</span>
								</div>
							) }
					</div>
				) }
			</div>
		);
	}
}

const connectComponent = connect( ( state, { query, statsType, showQueryDate } ) => {
	const siteId = getSelectedSiteId( state );
	return {
		queryDate: showQueryDate ? getSiteStatsQueryDate( state, siteId, statsType, query ) : null,
		requesting: showQueryDate
			? isRequestingSiteStatsForQuery( state, siteId, statsType, query )
			: false,
	};
} );

export default flowRight( connectComponent, localize )( StatsDatePicker );
