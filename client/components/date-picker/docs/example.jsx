/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import DatePicker from 'calypso/components/date-picker';
import EventsTooltip from 'calypso/components/date-picker/events-tooltip';

const events = [
	{
		title: 'Today',
		date: new Date(),
		type: 'scheduled',
	},

	{
		title: 'Social Media - Facebook',
		date: new Date( +new Date() + 60 * 60 * 24 * 1000 ),
		socialIcon: 'facebook',
	},

	{
		title: 'Social Media - Twitter',
		date: new Date(),
		socialIcon: 'twitter',
		socialIconColor: false,
	},

	{
		title: 'Social Media - Google Plus',
		date: new Date(),
		socialIcon: 'google-plus',
	},

	{
		title: 'Social Media - LinkedIn',
		date: new Date(),
		socialIcon: 'linkedin',
	},

	{
		title: 'Social Media - Tumblr',
		date: new Date( +new Date() + 60 * 60 * 24 * 1000 ),
		socialIcon: 'tumblr',
	},

	{
		title: 'Social Media - Path',
		date: new Date(),
		socialIcon: 'path',
		socialIconColor: false,
	},

	{
		title: 'Social Media - Eventbrite',
		date: new Date(),
		socialIcon: 'eventbrite',
		socialIconColor: false,
	},

	{
		title: 'Gridicon - Time',
		date: new Date(),
		icon: 'time',
	},

	{
		title: 'Gridicon - Offline',
		date: new Date(),
		icon: 'offline',
	},

	{
		title: 'Gridicon - Shipping',
		date: new Date(),
		icon: 'shipping',
	},

	{
		title: 'Tomorrow is tomorrow',
		date: new Date( +new Date() + 60 * 60 * 24 * 1000 ),
		type: 'future',
	},
	{
		title: 'Yesterday',
		date: new Date( +new Date() - 60 * 60 * 24 * 1000 ),
		type: 'past',
	},
	{
		title: 'Retro birthday',
		date: new Date( '1977-07-18' ),
		type: 'birthday',
		icon: 'offline',
	},
];

/*
 * Date Picker Demo
 */
class DatePickerExample extends Component {
	state = {
		eventsByDay: [],
		selectedDay: null,
		showTooltip: false,
		tooltipContext: null,
	};

	selectDay = ( date, modifiers ) => {
		this.setState( { selectedDay: date } );

		if ( date ) {
			console.log( date.toDate(), modifiers ); // eslint-disable-line no-console
		}
	};

	handleDayMouseEnter = ( date, modifiers, event, eventsByDay ) => {
		this.setState( {
			eventsByDay,
			tooltipContext: event.target,
			showTooltip: true,
		} );
	};

	handleDayMouseLeave = () => {
		this.setState( {
			eventsByDay: [],
			tooltipContext: null,
			showTooltip: false,
		} );
	};

	render() {
		// custom tooltip title
		const tooltipTitle = this.props.translate( '%d Event', '%d Events', {
			count: this.state.eventsByDay.length,
			args: this.state.eventsByDay.length,
		} );

		return (
			<Card style={ { width: '300px', margin: 0 } }>
				<DatePicker
					disabledDays={ [ { before: new Date() } ] }
					events={ events }
					onSelectDay={ this.selectDay }
					onDayMouseEnter={ this.handleDayMouseEnter }
					onDayMouseLeave={ this.handleDayMouseLeave }
					selectedDay={ this.state.selectedDay }
				/>

				<EventsTooltip
					events={ this.state.eventsByDay }
					context={ this.state.tooltipContext }
					isVisible={ this.state.showTooltip }
					title={ tooltipTitle }
					maxEvents={ 5 }
				/>
			</Card>
		);
	}
}

const localizedDatePickerExample = localize( DatePickerExample );

localizedDatePickerExample.displayName = 'DatePicker';

export default localizedDatePickerExample;
