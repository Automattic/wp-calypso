/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import { localize, moment } from 'i18n-calypso';
import { DateUtils } from 'react-day-picker';
import Gridicon from 'gridicons';
/**
 * Internal dependencies
 */
import Button from 'components/button';
import DatePicker from 'components/date-picker';
import Popover from 'components/popover';

export class DateRangeSelector extends Component {
	constructor( props ) {
		super( props );
		this.dateRangeButton = React.createRef();
		this.state = this.getInitialState();
		this.handleDayClick = this.handleDayClick.bind( this );
		this.handleDayMouseEnter = this.handleDayMouseEnter.bind( this );
		this.handleResetClick = this.handleResetClick.bind( this );
	}

	getInitialState = () => ( {
		from: null,
		to: null,
		enteredTo: null,
	} );

	isSelectingFirstDay( from, to, day ) {
		const isBeforeFirstDay = from && DateUtils.isDayBefore( day, from );
		const isRangeSelected = from && to;
		return ! from || isBeforeFirstDay || isRangeSelected;
	}

	handleDayClick( date ) {
		const day = date.toDate();
		const { from, to } = this.state;
		if ( from && to && day >= from && day <= to ) {
			this.handleResetClick();
			return;
		}
		if ( this.isSelectingFirstDay( from, to, day ) ) {
			this.setState( {
				from: day,
				to: null,
				enteredTo: null,
			} );
		} else {
			this.setState( {
				to: day,
				enteredTo: day,
			} );
		}
	}

	handleDayMouseEnter( day ) {
		const { from, to } = this.state;
		if ( ! this.isSelectingFirstDay( from, to, day ) ) {
			this.setState( {
				enteredTo: day,
			} );
		}
	}
	handleResetClick() {
		this.setState( this.getInitialState() );
	}

	render() {
		const { translate, isVisible, onButtonClick, onClose } = this.props;
		const { from, to, enteredTo } = this.state;
		const modifiers = { start: from, end: enteredTo };
		const disabledDays = [ { before: this.state.from, after: new Date() } ];
		const selectedDays = [ from, { from, to: enteredTo } ];
		const fromMoment = from ? moment( from ).format( 'll' ) : null;
		const toMoment = to ? moment( to ).format( 'll' ) : null;

		const buttonClass = classnames( {
			filterbar__selection: true,
			'is-selected': !! fromMoment,
		} );
		return (
			<Fragment>
				<Button
					className={ buttonClass }
					compact
					borderless
					onClick={ onButtonClick }
					ref={ this.dateRangeButton }
				>
					{ fromMoment && ! toMoment && `${ fromMoment }` }
					{ fromMoment &&
						toMoment &&
						`${ fromMoment } to
							 ${ toMoment }` }
					{ ! from && ! to && translate( 'Date Range' ) }
				</Button>
				{ ( from || to ) && (
					<Button
						className="filterbar__selection-close"
						compact
						borderless
						onClick={ this.handleResetClick }
					>
						<Gridicon icon="cross-small" />
					</Button>
				) }
				<Popover
					id="filterbar__date-range"
					isVisible={ isVisible }
					onClose={ onClose }
					autoPosition={ true }
					context={ this.dateRangeButton.current }
				>
					<div className="filterbar__date-range-wrap">
						<DatePicker
							fromMonth={ from }
							selectedDays={ selectedDays }
							disabledDays={ disabledDays }
							modifiers={ modifiers }
							onSelectDay={ this.handleDayClick }
							onDayMouseEnter={ this.handleDayMouseEnter }
						/>
						<div>
							{ ! to && <Gridicon icon="info" /> }
							{ ! from && ! to && translate( 'Please select the first day.' ) }
							{ from && ! to && translate( 'Please select the last day.' ) }
						</div>
					</div>
				</Popover>
			</Fragment>
		);
	}
}

export default localize( DateRangeSelector );
