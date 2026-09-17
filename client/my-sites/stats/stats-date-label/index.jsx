import { localize } from 'i18n-calypso';
import { useMemo } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getShortcuts } from 'calypso/components/date-range/use-shortcuts';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { NAVIGATION_METHOD_ARROW } from 'calypso/my-sites/stats/constants';
import { getMomentSiteZone } from 'calypso/my-sites/stats/hooks/use-moment-site-zone';
import {
	getSiteStatsQueryDate,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { isAutoRefreshAllowedForQuery } from 'calypso/state/stats/lists/utils';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import DateLabelDrill from './date-label-drill';

import './style.scss';

function StatsDateLabel( {
	date,
	period,
	summary,
	query,
	queryParams,
	isActivity,
	showQueryDate = false,
	isShort = false,
	dateRange,
	queryDate,
	reduxState,
	translate,
	momentSiteZone,
} ) {
	// Integrated from withIsDrillingDownHook HOC.
	// Re-reads sessionStorage when period or navigation method changes.
	const isDrillingDown = useMemo( () => {
		return sessionStorage.getItem( 'jetpack_stats_date_range_is_drilling_down' );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ period, queryParams?.navigation ] );

	function dateForCustomRange( startDate, endDate, selectedShortcut = null ) {
		// Generate a full date range for the label.
		const localizedStartDate = momentSiteZone( startDate );
		const localizedEndDate = momentSiteZone( endDate );

		// If it's a partial month but ends today.
		if (
			localizedStartDate.isSame( localizedStartDate.clone().startOf( 'month' ), 'day' ) &&
			localizedEndDate.isSame( momentSiteZone(), 'day' ) &&
			localizedStartDate.isSame( localizedEndDate, 'month' ) &&
			( ! selectedShortcut || selectedShortcut.id === 'month_to_date' )
		) {
			return localizedStartDate.format( 'MMMM YYYY' );
		}

		// If it's a partial year but ends today.
		if (
			localizedStartDate.isSame( localizedStartDate.clone().startOf( 'year' ), 'day' ) &&
			localizedEndDate.isSame( momentSiteZone(), 'day' ) &&
			localizedStartDate.isSame( localizedEndDate, 'year' ) &&
			( ! selectedShortcut || selectedShortcut.id === 'year_to_date' )
		) {
			return localizedStartDate.format( 'YYYY' );
		}

		// If it's the same day, show single date.
		if ( localizedStartDate.isSame( localizedEndDate, 'day' ) ) {
			return localizedStartDate.isSame( momentSiteZone(), 'year' )
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
				localizedStartDate.isSame( momentSiteZone(), 'year' )
					? ''
					: localizedEndDate.format( ', YYYY' ) // Only append year if it's not the current year.
			}`;
		}

		return `${ localizedStartDate.format( 'll' ) } - ${ localizedEndDate.format( 'll' ) }`;
	}

	function dateForSummarize( selectedShortcut = null ) {
		if ( query.start_date ) {
			if (
				selectedShortcut?.label &&
				! [ 'month_to_date', 'year_to_date' ].includes( selectedShortcut?.id )
			) {
				return selectedShortcut.label;
			}
			return dateForCustomRange( query.start_date, query.date, selectedShortcut );
		}

		const localizedDate = momentSiteZone();

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

	function dateForDisplay( selectedShortcut = null ) {
		if (
			selectedShortcut?.label &&
			! [ 'month_to_date', 'year_to_date' ].includes( selectedShortcut?.id )
		) {
			return selectedShortcut.label;
		}

		const weekPeriodFormat = isShort ? 'll' : 'LL';

		// Respect the dateRange if provided.
		if ( dateRange?.chartStart && dateRange?.chartEnd ) {
			return dateForCustomRange( dateRange.chartStart, dateRange.chartEnd, selectedShortcut );
		}

		// Ensure we have a moment instance here to work with.
		const localizedDate = momentSiteZone( date );
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

	function renderQueryDate() {
		let content = '';
		if ( queryDate && isAutoRefreshAllowedForQuery( query ) ) {
			const today = momentSiteZone();
			const queryDateMoment = momentSiteZone( queryDate );
			const isToday = today.isSame( queryDateMoment, 'day' );

			content = translate( '{{b}}Last update: %(time)s{{/b}} (Updates every 30 minutes)', {
				args: { time: isToday ? queryDateMoment.format( 'LT' ) : queryDateMoment.fromNow() },
				components: {
					b: <span className="stats-date-label__last-update" />,
				},
			} );
		}

		return (
			<div className="stats-date-label__refresh-status">
				<span className="stats-date-label__update-date">{ content }</span>
			</div>
		);
	}

	const isSummarizeQuery = query?.summarize;
	const { selectedShortcut } = getShortcuts( reduxState, dateRange, translate );
	const shortDisplayDate = isShort ? dateForDisplay( selectedShortcut ) : null;
	const summarizeDisplayDate = isSummarizeQuery ? dateForSummarize( selectedShortcut ) : null;
	const displayDate = isShort ? shortDisplayDate : summarizeDisplayDate;

	const previousDisplayDate = useMemo( () => {
		if ( ! isDrillingDown ) {
			sessionStorage.removeItem( 'jetpack_stats_date_range_is_drilling_down_date_history' );
		}

		if ( ! displayDate ) {
			return null;
		}

		const dateHistory = JSON.parse(
			sessionStorage.getItem( 'jetpack_stats_date_range_is_drilling_down_date_history' ) || '[]'
		);
		const isArrowNavigation = queryParams?.navigation === NAVIGATION_METHOD_ARROW;

		// For the arrow navigation, we want to replace the last element with the new date.
		if ( isArrowNavigation ) {
			dateHistory.pop();
		}

		// Only update history if the date is new
		if ( ! dateHistory.includes( displayDate ) ) {
			dateHistory.push( displayDate );
			sessionStorage.setItem(
				'jetpack_stats_date_range_is_drilling_down_date_history',
				JSON.stringify( dateHistory )
			);
		}

		return dateHistory.length > 1 ? dateHistory[ dateHistory.length - 2 ] : null;
	}, [ displayDate, isDrillingDown, queryParams?.navigation ] );

	/* eslint-disable wpcalypso/jsx-classname-namespace*/
	let sectionTitle = isActivity
		? translate( '{{prefix}}Activity for {{/prefix}}{{period/}}', {
				components: {
					prefix: <span className="prefix" />,
					period: (
						<span className="period">
							<span className="date">
								{ isSummarizeQuery
									? dateForSummarize( selectedShortcut )
									: dateForDisplay( selectedShortcut ) }
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
									? dateForSummarize( selectedShortcut )
									: dateForDisplay( selectedShortcut ) }
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
				<span className="date">{ dateForDisplay( selectedShortcut ) }</span>
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
						{ isDrillingDown ? (
							<DateLabelDrill previousDisplayDate={ previousDisplayDate }>
								{ sectionTitle }
							</DateLabelDrill>
						) : (
							sectionTitle
						) }
					</h3>
					{ showQueryDate && renderQueryDate() }
				</div>
			) }
		</div>
	);
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

export default compose( connectComponent, localize, withLocalizedMoment )( StatsDateLabel );
