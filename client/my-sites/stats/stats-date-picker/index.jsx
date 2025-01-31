import { localize } from 'i18n-calypso';
import { flowRight, get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { getShortcuts } from 'calypso/components/date-range/use-shortcuts';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { getMomentSiteZone } from 'calypso/my-sites/stats/hooks/use-moment-site-zone';
import {
	getSiteStatsQueryDate,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { isAutoRefreshAllowedForQuery } from 'calypso/state/stats/lists/utils';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DateLabelDrill from './date-label-drill';
import withIsDrillingDownHook from './with-is-drilling-down-hook';

import './style.scss';

// TODO: Rename this component to `StatsDateLabel` and refactor it as a Functional Component.
class StatsDatePicker extends Component {
	static propTypes = {
		date: PropTypes.oneOfType( [ PropTypes.object.isRequired, PropTypes.string.isRequired ] ),
		period: PropTypes.string.isRequired,
		summary: PropTypes.bool,
		query: PropTypes.object,
		statType: PropTypes.string,
		isActivity: PropTypes.bool,
		showQueryDate: PropTypes.bool,
		isShort: PropTypes.bool,
	};

	static defaultProps = {
		showQueryDate: false,
		isActivity: false,
		isShort: false,
	};

	dateForSummarize() {
		const { query, moment, translate } = this.props;

		if ( query.start_date ) {
			return this.dateForCustomRange( query.start_date, query.date );
		}

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

	dateForCustomRange( startDate, endDate, selectedShortcut = null ) {
		const { moment, momentSiteZone } = this.props;

		// Generate a full date range for the label.
		const localizedStartDate = moment( startDate );
		const localizedEndDate = moment( endDate );

		// If it's a partial month but ends today.
		if (
			localizedStartDate.isSame( localizedStartDate.clone().startOf( 'month' ), 'day' ) &&
			localizedEndDate.isSame( momentSiteZone, 'day' ) &&
			localizedStartDate.isSame( localizedEndDate, 'month' ) &&
			( ! selectedShortcut || selectedShortcut.id === 'month_to_date' )
		) {
			return localizedStartDate.format( 'MMMM YYYY' );
		}

		// If it's a partial year but ends today.
		if (
			localizedStartDate.isSame( localizedStartDate.clone().startOf( 'year' ), 'day' ) &&
			localizedEndDate.isSame( momentSiteZone, 'day' ) &&
			localizedStartDate.isSame( localizedEndDate, 'year' ) &&
			( ! selectedShortcut || selectedShortcut.id === 'year_to_date' )
		) {
			return localizedStartDate.format( 'YYYY' );
		}

		// If it's the same day, show single date.
		if ( localizedStartDate.isSame( localizedEndDate, 'day' ) ) {
			return localizedStartDate.isSame( moment(), 'year' )
				? localizedStartDate.format( 'MMM D' )
				: localizedStartDate.format( 'll' );
		}

		// If it's a full month.
		if (
			localizedStartDate.isSame( localizedStartDate.clone().startOf( 'month' ), 'day' ) &&
			localizedEndDate.isSame( localizedEndDate.clone().endOf( 'month' ), 'day' ) &&
			localizedStartDate.isSame( localizedEndDate, 'month' )
		) {
			return localizedStartDate.format( 'MMMM YYYY' );
		}

		// If it's a full year.
		if (
			localizedStartDate.isSame( localizedStartDate.clone().startOf( 'year' ), 'day' ) &&
			localizedEndDate.isSame( localizedEndDate.clone().endOf( 'year' ), 'day' ) &&
			localizedStartDate.isSame( localizedEndDate, 'year' )
		) {
			return localizedStartDate.format( 'YYYY' );
		}

		if ( localizedStartDate.year() === localizedEndDate.year() ) {
			return `${ localizedStartDate.format( 'MMM D' ) } - ${ localizedEndDate.format( `MMM D` ) }${
				localizedStartDate.isSame( moment(), 'year' ) ? '' : localizedEndDate.format( ', YYYY' ) // Only append year if it's not the current year.
			}`;
		}

		return `${ localizedStartDate.format( 'll' ) } - ${ localizedEndDate.format( 'll' ) }`;
	}

	dateForDisplay( selectedShortcut = null ) {
		if (
			selectedShortcut?.label &&
			! [ 'custom_date_range', 'month_to_date', 'year_to_date' ].includes( selectedShortcut?.id )
		) {
			return selectedShortcut.label;
		}

		const { date, moment, period, translate, isShort, dateRange } = this.props;
		const weekPeriodFormat = isShort ? 'll' : 'LL';

		// Respect the dateRange if provided.
		if ( dateRange?.chartStart && dateRange?.chartEnd ) {
			return this.dateForCustomRange( dateRange.chartStart, dateRange.chartEnd, selectedShortcut );
		}

		// Ensure we have a moment instance here to work with.
		const momentDate = moment.isMoment( date ) ? date : moment( date );
		const localizedDate = moment( momentDate.format( 'YYYY-MM-DD' ) );
		let formattedDate;

		switch ( period ) {
			case 'week':
				formattedDate = translate( '%(startDate)s - %(endDate)s', {
					context: 'Date range for which stats are being displayed',
					args: {
						startDate: localizedDate.startOf( 'week' ).add( 1, 'd' ).format( weekPeriodFormat ),
						endDate: localizedDate.endOf( 'week' ).add( 1, 'd' ).format( weekPeriodFormat ),
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
		const { query, queryDate, moment, translate } = this.props;

		let content = '';
		if ( queryDate && isAutoRefreshAllowedForQuery( query ) ) {
			const today = moment();
			const date = moment( queryDate );
			const isToday = today.isSame( date, 'day' );

			content = translate( '{{b}}Last update: %(time)s{{/b}} (Updates every 30 minutes)', {
				args: { time: isToday ? date.format( 'LT' ) : date.fromNow() },
				components: {
					b: <span className="stats-date-picker__last-update" />,
				},
			} );
		}

		return (
			<div className="stats-date-picker__refresh-status">
				<span className="stats-date-picker__update-date">{ content }</span>
			</div>
		);
	}

	bindStatusIndicator = ( ref ) => {
		this.statusIndicator = ref;
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace*/
		const {
			summary,
			translate,
			query,
			showQueryDate,
			isActivity,
			isShort,
			dateRange,
			reduxState,
			// Used for drill-downs of the date range chart from `withIsDrillingDownHook`.
			isDrillingDown,
		} = this.props;
		const isSummarizeQuery = get( query, 'summarize' );
		const { selectedShortcut } = getShortcuts( reduxState, dateRange, translate );

		let sectionTitle = isActivity
			? translate( '{{prefix}}Activity for {{/prefix}}{{period/}}', {
					components: {
						prefix: <span className="prefix" />,
						period: (
							<span className="period">
								<span className="date">
									{ isSummarizeQuery
										? this.dateForSummarize()
										: this.dateForDisplay( selectedShortcut ) }
								</span>
							</span>
						),
					},
					comment: 'Example: "Activity for December 2017"',
			  } )
			: translate( '{{prefix}}Stats for {{/prefix}}{{period/}}', {
					components: {
						prefix: <span className="prefix" />,
						period: (
							<span className="period">
								<span className="date">
									{ isSummarizeQuery
										? this.dateForSummarize()
										: this.dateForDisplay( selectedShortcut ) }
								</span>
							</span>
						),
					},
					context: 'Stats: Main stats page heading',
					comment:
						'Example: "Stats for December 7", "Stats for December 8 - December 14", "Stats for December", "Stats for 2014"',
			  } );

		if ( isShort ) {
			sectionTitle = (
				<span className="period">
					<span className="date">{ this.dateForDisplay( selectedShortcut ) }</span>
				</span>
			);
		}

		return (
			<div>
				{ summary ? (
					<span>{ sectionTitle }</span>
				) : (
					<div className="stats-section-title">
						<h3>
							{ isDrillingDown ? <DateLabelDrill>{ sectionTitle }</DateLabelDrill> : sectionTitle }
						</h3>
						{ showQueryDate && this.renderQueryDate() }
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
		reduxState: state,
		momentSiteZone: getMomentSiteZone( state, siteId ),
	};
} );

export default flowRight(
	connectComponent,
	localize,
	withLocalizedMoment,
	withIsDrillingDownHook
)( StatsDatePicker );
