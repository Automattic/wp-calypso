/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { map, range, flatten, max, keys, zipObject, times, size, concat, merge } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { formatNumberMetric } from 'lib/format-number-compact';
import Popover from 'components/popover';

class Month extends PureComponent {
	static propTypes = {
		isHeader: PropTypes.bool,
		className: PropTypes.string,
		value: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		position: PropTypes.string,
		translate: PropTypes.func,
		href: PropTypes.string,
	};

	state = {
		showPopover: false,
	};

	static defaultProps = {
		position: 'top',
	};

	closePopover = () => {
		this.setState( { showPopover: false } );
	};

	openPopover = () => {
		const { isHeader, href } = this.props;

		if ( ! isHeader && href ) {
			page( href );
			return;
		}
		this.setState( { showPopover: ! this.state.showPopover } );
	};

	render() {
		const { isHeader, className, value, position, children } = this.props;
		const tagName = isHeader ? 'th' : 'td';
		return React.createElement(
			tagName,
			{
				className: className,
				ref: 'month',
				onClick: this.openPopover,
			},
			concat(
				children,
				<Popover
					isVisible={ this.state.showPopover }
					onClose={ this.closePopover }
					position={ position }
					key="popover"
					context={ this.refs && this.refs.month }
				>
					<div style={ { padding: '10px' } }>{ value }</div>
				</Popover>
			)
		);
	}
}

const StatsViewsMonths = props => {
	const { translate, dataKey, data, numberFormat, moment, siteSlug } = props;
	const isAverageChart = dataKey === 'average';
	let earliestDate = moment();
	const today = moment();

	const momentFromMonthYear = ( month, year ) => {
		const monthValue = parseInt( month ) + 1;
		return moment( `${ year }-${ monthValue }-1`, 'YYYY-M-D' );
	};

	const getMonthTotal = ( totals, month ) => {
		const sum = totals.months[ month ];
		const count = totals.monthsCount[ month ];
		if ( isAverageChart ) {
			return Math.round( sum / count );
		}
		return sum;
	};

	const allMonths = flatten(
		map( data, ( year, yearNumber ) => {
			return map( year, ( month, monthIndex ) => {
				// keep track of earliest date to fill in zeros when applicable
				const momentMonth = momentFromMonthYear( monthIndex, yearNumber );
				if ( momentMonth.isBefore( earliestDate ) ) {
					earliestDate = moment( momentMonth );
				}
				return month[ dataKey ];
			} );
		} )
	);

	const highestMonth = max( allMonths );
	const yearsObject = zipObject(
		keys( data ),
		times( size( data ), () => {
			return 0;
		} )
	);
	const monthsObject = zipObject(
		range( 0, 12 ),
		times( 12, () => {
			return 0;
		} )
	);
	const totals = {
		years: merge( {}, yearsObject ),
		months: merge( {}, monthsObject ),
		yearsCount: merge( {}, yearsObject ),
		monthsCount: merge( {}, monthsObject ),
	};

	const years = map( data, ( item, year ) => {
		const cells = map( range( 0, 12 ), month => {
			let value = item[ month ] ? item[ month ][ dataKey ] : null;
			let displayValue;
			const momentMonth = momentFromMonthYear( month, year );
			let className;

			// if this month is after our earliest date, and not in the future
			// and no value exists, display a zero
			if ( ! value && momentMonth.isAfter( earliestDate ) && today.isAfter( momentMonth ) ) {
				className = 'stats-views__month level-0';
				value = 0;
				displayValue = 0;
				totals.yearsCount[ year ] += 1;
				totals.monthsCount[ month ] += 1;
			}

			if ( value > 0 ) {
				const level = Math.ceil( value / highestMonth * 5 );
				className = `stats-views__month level-${ level }`;
				totals.years[ year ] += value;
				totals.months[ month ] += value;
				totals.yearsCount[ year ] += 1;
				totals.monthsCount[ month ] += 1;
				displayValue = formatNumberMetric( value );
			}
			return (
				<Month
					href={ `/stats/month/${ siteSlug }?startDate=${ year }-${ month + 1 }-1` }
					className={ className }
					key={ `month-${ month }` }
					value={ numberFormat( value ) }
				>
					{ displayValue }
				</Month>
			);
		} );
		const yearTotal = isAverageChart
			? Math.round( totals.years[ year ] / totals.yearsCount[ year ] )
			: totals.years[ year ];
		cells.unshift(
			<Month
				className="stats-views__month is-year"
				position="left"
				key={ `label-${ year }` }
				value={ yearTotal }
			>
				{ year }
			</Month>
		);
		return <tr key={ `year-${ year }` }>{ cells }</tr>;
	} );

	return (
		<table className="stats-views__months">
			<thead>
				<tr>
					<th />
					<Month value={ numberFormat( getMonthTotal( totals, 0 ) ) } isHeader>
						{ translate( 'Jan' ) }
					</Month>
					<Month value={ numberFormat( getMonthTotal( totals, 1 ) ) } isHeader>
						{ translate( 'Feb' ) }
					</Month>
					<Month value={ numberFormat( getMonthTotal( totals, 2 ) ) } isHeader>
						{ translate( 'Mar' ) }
					</Month>
					<Month value={ numberFormat( getMonthTotal( totals, 3 ) ) } isHeader>
						{ translate( 'Apr' ) }
					</Month>
					<Month value={ numberFormat( getMonthTotal( totals, 4 ) ) } isHeader>
						{ translate( 'May' ) }
					</Month>
					<Month value={ numberFormat( getMonthTotal( totals, 5 ) ) } isHeader>
						{ translate( 'Jun' ) }
					</Month>
					<Month value={ numberFormat( getMonthTotal( totals, 6 ) ) } isHeader>
						{ translate( 'Jul' ) }
					</Month>
					<Month value={ numberFormat( getMonthTotal( totals, 7 ) ) } isHeader>
						{ translate( 'Aug' ) }
					</Month>
					<Month value={ numberFormat( getMonthTotal( totals, 8 ) ) } isHeader>
						{ translate( 'Sep' ) }
					</Month>
					<Month value={ numberFormat( getMonthTotal( totals, 9 ) ) } isHeader>
						{ translate( 'Oct' ) }
					</Month>
					<Month value={ numberFormat( getMonthTotal( totals, 10 ) ) } isHeader>
						{ translate( 'Nov' ) }
					</Month>
					<Month value={ numberFormat( getMonthTotal( totals, 11 ) ) } isHeader>
						{ translate( 'Dec' ) }
					</Month>
				</tr>
			</thead>
			<tbody>{ years }</tbody>
		</table>
	);
};

export default localize( StatsViewsMonths );
