import page from '@automattic/calypso-router';
import { Popover } from '@automattic/components';
import { localize, numberFormat } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { createRef, createElement, PureComponent } from 'react';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

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

	monthRef = createRef();

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
		return createElement(
			tagName,
			{
				className: className,
				ref: this.monthRef,
				onClick: this.openPopover,
			},
			<>{ children }</>,
			<Popover
				isVisible={ this.state.showPopover }
				onClose={ this.closePopover }
				position={ position }
				context={ this.monthRef.current }
			>
				<div style={ { padding: '10px' } }>{ value }</div>
			</Popover>
		);
	}
}

const StatsViewsMonths = ( props ) => {
	const { translate, dataKey, data, moment, siteSlug, showYearTotal = false } = props;
	const dataEntries = data ? Object.entries( data ) : [];
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

	const allMonths = dataEntries.flatMap( ( [ yearNumber, year ] ) =>
		Object.entries( year ).map( ( [ monthIndex, month ] ) => {
			// keep track of earliest date to fill in zeros when applicable
			const momentMonth = momentFromMonthYear( monthIndex, yearNumber );
			if ( momentMonth.isBefore( earliestDate ) ) {
				earliestDate = moment( momentMonth );
			}
			return month[ dataKey ];
		} )
	);

	const highestMonth = Math.max( ...allMonths );
	const yearsObject = Object.fromEntries( dataEntries.map( ( [ year ] ) => [ year, 0 ] ) );
	const monthsArray = Array.from( { length: 12 }, ( _, month ) => month ); // [ 0, 1, ..., 11 ]
	const monthsObject = Object.fromEntries( monthsArray.map( ( month ) => [ month, 0 ] ) );
	const totals = {
		years: { ...yearsObject },
		months: { ...monthsObject },
		yearsCount: { ...yearsObject },
		monthsCount: { ...monthsObject },
	};

	let totalValue = 0;

	const years = dataEntries.map( ( [ year, item ] ) => {
		const cells = monthsArray.map( ( month ) => {
			let value = item[ month ]?.[ dataKey ] ?? null;
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
				const level = Math.ceil( ( value / highestMonth ) * 5 );
				className = `stats-views__month level-${ level }`;
				totals.years[ year ] += value;
				totals.months[ month ] += value;
				totals.yearsCount[ year ] += 1;
				totals.monthsCount[ month ] += 1;
				displayValue = numberFormat( value, { decimals: 1, notation: 'compact' } );
			}

			totalValue += value;

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
				value={ numberFormat( yearTotal ) }
			>
				{ year }
			</Month>
		);
		if ( showYearTotal ) {
			cells.push(
				<td key={ `label-${ year }-total` } className="stats-views__month is-total">
					{ numberFormat( yearTotal ) }
				</td>
			);
		}

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
					{ showYearTotal && (
						<Month value={ numberFormat( totalValue ) } isHeader>
							{ translate( 'Totals' ) }
						</Month>
					) }
				</tr>
			</thead>
			<tbody>{ years }</tbody>
		</table>
	);
};

export default localize( withLocalizedMoment( StatsViewsMonths ) );
