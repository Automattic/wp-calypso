import { eye } from '@automattic/components/src/icons';
import {
	Icon,
	people,
	starEmpty,
	commentContent,
	chevronRight,
	postContent,
} from '@wordpress/icons';
import clsx from 'clsx';
import { numberFormat, translate } from 'i18n-calypso';
import { capitalize } from 'lodash';
import moment from 'moment';
import memoizeLast from 'calypso/lib/memoize-last';
import { rangeOfPeriod } from 'calypso/state/stats/lists/utils';
import { parseLocalDate } from '../utils';

export function formatDate( date, period, chartStart = null, chartEnd = null ) {
	// NOTE: Consider localizing the dates, especially for the 'week' case.
	const momentizedDate = moment( date );
	const endDate = momentizedDate.clone().add( 6, 'days' );

	switch ( period ) {
		case 'hour':
			// TODO: align the time format with email stats.
			return momentizedDate.format( 'MMM D HH:00' );
		case 'day':
			return momentizedDate.format( 'LL' );
		case 'week':
			// Make partial period display with correct start and end dates.
			if ( chartStart && momentizedDate.isBefore( chartStart ) ) {
				return (
					moment( chartStart ).format( 'LL' ) +
					' - ' +
					momentizedDate.add( 6, 'days' ).format( 'LL' )
				);
			}
			if ( chartEnd && endDate.isAfter( chartEnd ) ) {
				return momentizedDate.format( 'LL' ) + ' - ' + moment( chartEnd ).format( 'LL' );
			}

			return momentizedDate.format( 'LL' ) + ' - ' + momentizedDate.add( 6, 'days' ).format( 'LL' );
		case 'month':
			return momentizedDate.format( 'MMMM YYYY' );
		case 'year':
			return momentizedDate.format( 'YYYY' );
		default:
			return null;
	}
}

export function getQueryDate( queryDate, timezoneOffset, period, quantity ) {
	const momentSiteZone = moment().utcOffset( timezoneOffset );
	const endOfPeriodDate = rangeOfPeriod( period, momentSiteZone.locale( 'en' ) ).endOf;
	const periodDifference = moment( endOfPeriodDate ).diff( moment( queryDate ), period );
	if ( periodDifference >= quantity ) {
		return moment( endOfPeriodDate )
			.subtract( Math.floor( periodDifference / quantity ) * quantity, period )
			.format( 'YYYY-MM-DD' );
	}
	return endOfPeriodDate;
}

const EMPTY_RESULT = [];
export const buildChartData = memoizeLast(
	( activeLegend, chartTab, data, period, queryDate, customRange ) => {
		if ( ! data ) {
			return EMPTY_RESULT;
		}
		return data.map( ( record ) => {
			const nestedValue = activeLegend.length ? record[ activeLegend[ 0 ] ] : null;

			const recordClassName =
				record.classNames && record.classNames.length ? record.classNames.join( ' ' ) : null;
			const className = clsx( recordClassName, {
				'is-selected': record.period === queryDate,
			} );

			const item = addTooltipData(
				chartTab,
				{
					label: record[ `label${ capitalize( period ) }` ],
					value: record[ chartTab ],
					data: record,
					nestedValue,
					className,
				},
				period,
				customRange
			);

			return item;
		} );
	}
);

// data validation for line chart
export const transformChartDataToLineFormat = memoizeLast(
	( chartData, activeLegend = [], activeTab, primaryColor, secondaryColor ) => {
		if ( ! Array.isArray( chartData ) || chartData.length === 0 ) {
			return [];
		}

		const series = [];

		const mainSeries = chartData
			.map( ( record ) => {
				const date = parseLocalDate( record.data.period );
				const value = record.data[ activeTab.attr ];
				if ( isNaN( date.getTime() ) || typeof value !== 'number' ) {
					return null;
				}
				return { date, value, label: record.tooltipData?.[ 0 ].label };
			} )
			.filter( Boolean );

		if ( mainSeries.length > 0 ) {
			series.push( {
				label: activeTab.label,
				options: { stroke: primaryColor },
				icon: activeTab.icon,
				data: mainSeries,
			} );
		}

		// Only add visitors series if visitors is active in legend
		// It has to be visitors as that is the only case where we show two series, i.e. activeLegend[ 0 ] is 'visitors' only.
		// We should probably figure out a more general way to handle this.
		if ( activeLegend.length > 0 ) {
			const secondarySeries = chartData
				.map( ( record ) => {
					const date = parseLocalDate( record.data.period );
					const value = record.data.visitors;
					if ( isNaN( date.getTime() ) || typeof value !== 'number' ) {
						return null;
					}
					return { date, value, label: record.tooltipData?.[ 0 ].label };
				} )
				.filter( Boolean );

			if ( secondarySeries.length > 0 ) {
				series.push( {
					label: translate( 'Visitors' ),
					options: { stroke: secondaryColor },
					icon: <Icon className="gridicon" icon={ people } />,
					data: secondarySeries,
				} );
			}
		}

		return series;
	}
);

function addTooltipData( chartTab, item, period, customRange = {} ) {
	const tooltipData = [];
	tooltipData.push( {
		label: formatDate( item.data.period, period, customRange.chartStart, customRange.chartEnd ),
		className: 'is-date-label',
		value: null,
	} );

	switch ( chartTab ) {
		case 'comments':
			tooltipData.push( {
				label: translate( 'Comments' ),
				value: numberFormat( item.value ),
				className: 'is-comments',
				icon: <Icon className="gridicon" icon={ commentContent } />,
			} );
			break;

		case 'likes':
			tooltipData.push( {
				label: translate( 'Likes' ),
				value: numberFormat( item.value ),
				className: 'is-likes',
				icon: <Icon className="gridicon" icon={ starEmpty } />,
			} );
			break;

		default:
			tooltipData.push( {
				label: translate( 'Views' ),
				value: numberFormat( item.data.views ),
				className: 'is-views',
				icon: <Icon className="gridicon" icon={ eye } />,
			} );

			if ( Number.isFinite( item.data.visitors ) ) {
				tooltipData.push( {
					label: translate( 'Visitors' ),
					value: numberFormat( item.data.visitors ),
					className: 'is-visitors',
					icon: <Icon className="gridicon" icon={ people } />,
				} );
				tooltipData.push( {
					label: translate( 'Views Per Visitor' ),
					value: numberFormat( item.data.views / item.data.visitors, { decimals: 2 } ),
					className: 'is-views-per-visitor',
					icon: <Icon className="gridicon" icon={ chevronRight } />,
				} );
			}

			if ( item.data.post_titles && item.data.post_titles.length ) {
				// only show two post titles
				if ( item.data.post_titles.length > 2 ) {
					tooltipData.push( {
						label: translate( 'Posts Published' ),
						value: numberFormat( item.data.post_titles.length ),
						className: 'is-published-nolist',
						icon: <Icon className="gridicon" icon={ postContent } />,
					} );
				} else {
					tooltipData.push( {
						label:
							translate( 'Post Published', 'Posts Published', {
								textOnly: true,
								count: item.data.post_titles.length,
							} ) + ':',
						className: 'is-published',
						icon: <Icon className="gridicon" icon={ postContent } />,
						value: '',
					} );
					item.data.post_titles.forEach( ( post_title ) => {
						tooltipData.push( {
							className: 'is-published-item',
							label: post_title,
						} );
					} );
				}
			}
			break;
	}

	return { ...item, tooltipData };
}
