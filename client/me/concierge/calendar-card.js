/** @format */

/**
 * CalendarCard represents a day of schedulable concierge chats. Each card is expandable to
 * allow the user to select a specific time on the day. If the day has no availability, it will
 * not be expandable. When you stack a group of these cards together you'll get the scheduling
 * calendar view.
 */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { localize, moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FoldableCard from 'components/foldable-card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormSettingExplanation from 'components/forms/form-setting-explanation';

class CalendarCard extends Component {
	static propTypes = {
		date: PropTypes.number.isRequired,
		onSubmit: PropTypes.func.isRequired,
		times: PropTypes.arrayOf( PropTypes.number ).isRequired,
	};

	/**
	 * Returns a string representing the day of the week, with certain dates using natural
	 * language like "Today" or "Tomorrow" instead of the name of the day.
	 *
	 * @param {Number} date Timestamp of the date
	 * @returns {String} The name for the day of the week
	 */
	getDayOfWeekString = date => {
		const { translate } = this.props;
		const today = moment().startOf( 'day' );
		const dayOffset = today.diff( date.startOf( 'day' ), 'days' );

		switch ( dayOffset ) {
			case 0:
				return translate( 'Today' );
			case -1:
				return translate( 'Tomorrow' );
		}
		return date.format( 'dddd' );
	};

	renderHeader = () => {
		// The "Header" is that part of the foldable card that you click on to expand it.
		const date = moment( this.props.date );

		return (
			<div className="concierge__calendar-card-header">
				<Gridicon icon="calendar" className="concierge__calendar-card-header-icon" />
				<span>
					<b>{ this.getDayOfWeekString( date ) } —</b> { date.format( ' MMMM D' ) }
				</span>
			</div>
		);
	};

	render() {
		const { times, translate } = this.props;

		return (
			<FoldableCard
				className="concierge__calendar-card"
				clickableHeader={ ! isEmpty( times ) }
				compact
				disabled={ isEmpty( times ) }
				summary={ isEmpty( times ) ? translate( 'No sessions available' ) : null }
				header={ this.renderHeader() }
			>
				<FormFieldset>
					<FormLabel htmlFor="concierge-start-time">
						{ translate( 'Choose a starting time' ) }
					</FormLabel>
					<FormSelect id="concierge-start-time">
						{ times.map( time => (
							<option value={ time } key={ time }>
								{ moment( time ).format( 'h:mma z' ) }
							</option>
						) ) }
					</FormSelect>
					<FormSettingExplanation>
						{ translate( 'Sessions are 30 minutes long.' ) }
					</FormSettingExplanation>
				</FormFieldset>

				<FormFieldset>
					<Button primary onClick={ this.props.onSubmit }>
						{ translate( 'Book this session' ) }
					</Button>
				</FormFieldset>
			</FoldableCard>
		);
	}
}

export default localize( CalendarCard );
