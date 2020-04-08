/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import page from 'page';

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
		selectedDate: PropTypes.object.isRequired,
		onDateChange: PropTypes.func.isRequired,
		oldestDateAvailable: PropTypes.object.isRequired,
	};

	getDisplayDate = ( date, showTodayYesterday = true ) => {
		const { today, moment, translate } = this.props;

		const daysDiff = moment( today ).diff( date, 'days' );
		const yearToday = moment( today ).format( 'YYYY' );
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

		onDateChange( newSelectedDate );
	};

	goToNextDay = () => {
		if ( ! this.canGoToNextDay() ) {
			return false;
		}
		const { moment, onDateChange, selectedDate } = this.props;

		const newSelectedDate = moment( selectedDate ).add( 1, 'days' );

		onDateChange( newSelectedDate );
	};

	canGoToPreviousDay = () => {
		const { moment, selectedDate, oldestDateAvailable } = this.props;

		return ! oldestDateAvailable || ! moment( selectedDate ).isSame( oldestDateAvailable, 'day' );
	};

	canGoToNextDay = () => {
		const { today, moment, selectedDate } = this.props;

		return ! moment( selectedDate ).isSame( moment( today ), 'day' );
	};

	goToActivityLog = () => {
		page.redirect( `/activity/${ this.props.siteSlug }` );
	};

	onSpace = ( evt, fn ) => {
		if ( evt.key === ' ' ) {
			return fn;
		}

		return () => {};
	};

	render() {
		const { selectedDate, siteId, moment } = this.props;

		const previousDate = moment( selectedDate ).subtract( 1, 'days' );
		const nextDate = moment( selectedDate ).add( 1, 'days' );

		const previousDisplayDate = this.getDisplayDate( previousDate );
		const nextDisplayDate = this.getDisplayDate( nextDate, false );

		return (
			<div className="date-picker">
				<div className="date-picker__select-date">
					<div
						className="date-picker__select-date--previous"
						role="button"
						tabIndex={ 0 }
						onClick={ this.goToPreviousDay }
						onKeyDown={ this.onSpace( this.goToPreviousDay ) }
					>
						<Button compact borderless className="date-picker__button--previous">
							<Gridicon
								icon="chevron-left"
								className={ ! this.canGoToPreviousDay() && 'disabled' }
							/>
						</Button>

						<span
							className={ classNames( 'date-picker__display-date', {
								disabled: ! this.canGoToPreviousDay(),
							} ) }
						>
							{ previousDisplayDate }
						</span>
					</div>

					<DateRangeSelector
						siteId={ siteId }
						enabled={ true }
						customLabel={ <Gridicon icon="calendar" /> }
					/>

					<div
						className="date-picker__select-date--next"
						role="button"
						tabIndex={ 0 }
						onClick={ this.goToNextDay }
						onKeyDown={ this.onSpace( this.goToNextDay ) }
					>
						<span
							className={ classNames( 'date-picker__display-date', {
								disabled: ! this.canGoToNextDay(),
							} ) }
						>
							{ nextDisplayDate }
						</span>

						<Button compact borderless className="date-picker__button--next">
							<Gridicon icon="chevron-right" className={ ! this.canGoToNextDay() && 'disabled' } />
						</Button>
					</div>
				</div>

				<Gridicon
					icon="search"
					className="date-picker__search-icon"
					onClick={ this.goToActivityLog }
				/>
			</div>
		);
	}
}

export default localize( withLocalizedMoment( DatePicker ) );
