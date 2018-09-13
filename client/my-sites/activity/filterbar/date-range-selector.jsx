/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import classnames from 'classnames';
import { localize, moment } from 'i18n-calypso';
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
	}

	render() {
		const {
			translate,
			isVisible,
			onButtonClick,
			onClose,
			from,
			to,
			enteredTo,
			onDayClick,
			onDayMouseEnter,
			onResetSelection,
		} = this.props;
		const modifiers = { start: from, end: enteredTo };
		const disabledDays = [ { before: from, after: new Date() } ];
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
						onClick={ onResetSelection }
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
							onSelectDay={ onDayClick }
							onDayMouseEnter={ onDayMouseEnter }
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
