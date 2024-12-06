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
