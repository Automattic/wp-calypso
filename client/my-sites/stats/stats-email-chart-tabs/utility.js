import { Icon, people, starEmpty, chevronRight, postContent } from '@wordpress/icons';
import { numberFormat, translate } from 'i18n-calypso';
import { capitalize } from 'lodash';
import moment from 'moment';
import memoizeLast from 'calypso/lib/memoize-last';
import { rangeOfPeriod } from 'calypso/state/stats/lists/utils';

export function formatDate( date, period ) {
	// NOTE: Consider localizing the dates.
	const momentizedDate = moment( date );
	switch ( period ) {
		case 'hour':
			return momentizedDate.format( 'HH:mm' );
		case 'day':
			return momentizedDate.format( 'LL' );
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
export const buildChartData = memoizeLast( ( activeLegend, chartTab, data, period, date ) => {
	if ( ! data ) {
		return EMPTY_RESULT;
	}

	const filteredData = data.filter( ( record ) => moment( date ).isSameOrBefore( record.period ) );
	return filteredData.map( ( record ) => {
		const nestedValue = activeLegend.length ? record[ activeLegend[ 0 ] ] : null;

		return addTooltipData(
			chartTab,
			{
				label: record[ `label${ capitalize( period ) }` ],
				value: record[ chartTab ],
				data: record,
				nestedValue,
			},
			period
		);
	} );
} );

function addTooltipData( chartTab, item, period ) {
	const tooltipData = [];
	const label = ( () => {
		if ( 'hour' === period ) {
			return item.label;
		}
		return formatDate( item.data.period, period );
	} )();

	tooltipData.push( {
		label,
		className: 'is-date-label',
		value: null,
	} );

	switch ( chartTab ) {
		case 'opens_count':
			tooltipData.push( {
				label: translate( 'Opens' ),
				value: numberFormat( item.value ),
				className: 'is-opens',
				icon: <Icon className="gridicon" icon={ starEmpty } />,
			} );
			break;
		case 'unique_opens_count':
			tooltipData.push( {
				label: translate( 'Unique opens' ),
				value: numberFormat( item.value ),
				className: 'is-unqiue-opens',
				icon: <Icon className="gridicon" icon={ starEmpty } />,
			} );
			break;
		default:
			tooltipData.push( {
				label: translate( 'Views' ),
				value: numberFormat( item.data.views ),
				className: 'is-views',
				icon: (
					<svg
						className="gridicon"
						width="24"
						height="24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="m4 13 .67.336.003-.005a2.42 2.42 0 0 1 .094-.17c.071-.122.18-.302.329-.52.298-.435.749-1.017 1.359-1.598C7.673 9.883 9.498 8.75 12 8.75s4.326 1.132 5.545 2.293c.61.581 1.061 1.163 1.36 1.599a8.29 8.29 0 0 1 .422.689l.002.005L20 13l.67-.336v-.003l-.003-.005-.008-.015-.028-.052a9.752 9.752 0 0 0-.489-.794 11.6 11.6 0 0 0-1.562-1.838C17.174 8.617 14.998 7.25 12 7.25S6.827 8.618 5.42 9.957c-.702.669-1.22 1.337-1.563 1.839a9.77 9.77 0 0 0-.516.845l-.008.015-.002.005-.001.002v.001L4 13Zm8 3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
							fill="#fff"
						/>
					</svg>
				),
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
