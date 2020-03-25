/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { withLocalizedMoment } from 'components/localized-moment';
import Button from 'components/forms/form-button';
import DateRangeSelector from 'my-sites/activity/filterbar/date-range-selector';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';

class DatePicker extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		selectedDate: PropTypes.instanceOf( Date ).isRequired,
		onDateChange: PropTypes.func.isRequired,
		oldestDateAvailable: PropTypes.instanceOf( Date ),
	};

	getDisplayDate = ( date, showTodayYesterday = true ) => {
		const { moment, translate } = this.props;

		const daysDiff = moment().diff( date, 'days' );
		const yearToday = moment().format( 'YYYY' );
		const yearDate = moment( date ).format( 'YYYY' );

		const dateFormat = yearToday === yearDate ? 'MMM D' : 'MMM D, YYYY';

		if ( showTodayYesterday ) {
			switch ( daysDiff ) {
				case 0:
					return translate( 'Today' );
				case 1:
					return translate( 'Yesterday' );
			}
		}

		return moment( date ).format( dateFormat );
	};

	goToPreviousDay = () => {
		if ( ! this.canGoToPreviousDay() ) {
			return false;
		}
		const { moment, onDateChange, selectedDate } = this.props;

		const newSelectedDate = moment( selectedDate ).subtract( 1, 'days' );

		onDateChange( newSelectedDate.toDate() );
	};

	goToNextDay = () => {
		if ( ! this.canGoToNextDay() ) {
			return false;
		}
		const { moment, onDateChange, selectedDate } = this.props;

		const newSelectedDate = moment( selectedDate ).add( 1, 'days' );

		onDateChange( newSelectedDate.toDate() );
	};

	canGoToPreviousDay = () => {
		const { moment, selectedDate, oldestDateAvailable } = this.props;

		return ! oldestDateAvailable || ! moment( selectedDate ).isSame( oldestDateAvailable, 'day' );
	};

	canGoToNextDay = () => {
		const { moment, selectedDate } = this.props;

		return ! moment( selectedDate ).isSame( moment(), 'day' );
	};

	render() {
		const { selectedDate, siteId, moment } = this.props;

		const previousDate = moment( selectedDate ).subtract( 1, 'days' );
		const nextDate = moment( selectedDate ).add( 1, 'days' );

		const previousDisplayDate = this.getDisplayDate( previousDate );
		const nextDisplayDate = this.getDisplayDate( nextDate, false );

		return (
			<div className="date-picker">
				<Button compact borderless onClick={ this.goToPreviousDay }>
					<Gridicon icon="chevron-left" className={ ! this.canGoToPreviousDay() && 'disabled' } />
				</Button>

				<div className="date-picker__display-date">{ previousDisplayDate }</div>

				<DateRangeSelector
					siteId={ siteId }
					enabled={ true }
					customLabel={ <Gridicon icon="calendar" /> }
				/>

				<div
					className={ classNames( 'date-picker__display-date', {
						disabled: ! this.canGoToNextDay(),
					} ) }
				>
					{ nextDisplayDate }
				</div>

				<Button compact borderless onClick={ this.goToNextDay }>
					<Gridicon icon="chevron-right" className={ ! this.canGoToNextDay() && 'disabled' } />
				</Button>
				<div>Date selected: { this.getDisplayDate( selectedDate ) }</div>
			</div>
		);
	}
}

export default localize( withLocalizedMoment( DatePicker ) );
