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
		onDateRangeSelection: PropTypes.func.isRequired,
	};

	getDisplayDate = ( date, showTodayYesterday = true ) => {
		const { moment, translate } = this.props;

		const daysDiff = moment().diff( date, 'days' );
		const yearToday = moment().format( 'YYYY' );
		const yearDate = moment( date ).format( 'YYYY' );

		let dateFormat = 'MMM D';

		if ( yearToday !== yearDate ) {
			dateFormat = 'MMM D, YYYY';
		}

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

	shuttleLeft = () => {
		const { moment, onDateChange, selectedDate } = this.props;

		const newSelectedDate = moment( selectedDate ).subtract( 1, 'days' );

		onDateChange( newSelectedDate.toDate() );
	};

	shuttleRight = () => {
		if ( ! this.canShuttleRight() ) {
			return false;
		}

		const { moment, onDateChange, selectedDate } = this.props;

		const newSelectedDate = moment( selectedDate ).add( 1, 'days' );

		onDateChange( newSelectedDate.toDate() );
	};

	canShuttleRight = () => {
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
				<Button compact borderless onClick={ this.shuttleLeft }>
					<Gridicon icon="chevron-left" />
				</Button>

				<div className="date-picker__display-date">{ previousDisplayDate }</div>

				<DateRangeSelector
					siteId={ siteId }
					enabled={ true }
					customLabel={ <Gridicon icon="calendar" /> }
				/>

				<div
					className={ classNames( 'date-picker__display-date', {
						disabled: ! this.canShuttleRight(),
					} ) }
				>
					{ nextDisplayDate }
				</div>

				<Button compact borderless onClick={ this.shuttleRight }>
					<Gridicon icon="chevron-right" className={ ! this.canShuttleRight() && 'disabled' } />
				</Button>
				<div>Date selected: { this.getDisplayDate( selectedDate ) }</div>
			</div>
		);
	}
}

export default localize( withLocalizedMoment( DatePicker ) );
