import { formatNumber } from '@automattic/number-formatters';
import { Icon, starEmpty } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { capitalize } from 'lodash';
import moment from 'moment';
import memoizeLast from 'calypso/lib/memoize-last';
import { getMomentSiteZone } from 'calypso/my-sites/stats/hooks/use-moment-site-zone';
import { rangeOfPeriod } from 'calypso/state/stats/lists/utils';

export function formatDate( date, period ) {
	// NOTE: Consider localizing the dates.
	const momentizedDate = moment( date );
	switch ( period ) {
		case 'hour':
			return momentizedDate.format( 'MMM D' );
		case 'day':
			return momentizedDate.format( 'LL' );
		default:
			return null;
	}
}

export function getQueryDate( queryDate, state, siteId, period, quantity ) {
	const momentSiteZone = getMomentSiteZone( state, siteId );
	const endOfPeriodDate = rangeOfPeriod( period, momentSiteZone().locale( 'en' ) ).endOf;
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
		const formattedDate = formatDate( item.data.period, period );

		if ( 'hour' === period ) {
			return `${ formattedDate } ${ item.label }`;
		}

		return formattedDate;
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
				value: formatNumber( item.value ),
				className: 'is-opens',
				icon: <Icon className="gridicon" icon={ starEmpty } />,
			} );
			break;
		case 'unique_opens_count':
			tooltipData.push( {
				label: translate( 'Unique opens' ),
				value: formatNumber( item.value ),
				className: 'is-unqiue-opens',
				icon: <Icon className="gridicon" icon={ starEmpty } />,
			} );
			break;
		case 'clicks_count':
			tooltipData.push( {
				label: translate( 'Clicks' ),
				value: formatNumber( item.value ),
				className: 'is-clicks',
				icon: <Icon className="gridicon" icon={ starEmpty } />,
			} );
			break;
		default:
	}

	return { ...item, tooltipData };
}
