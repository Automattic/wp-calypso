/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize, moment } from 'i18n-calypso';
/**
 * Internal dependencies
 */
import CalendarCard from './calendar-card';
import CompactCard from 'components/card/compact';
import HeaderCake from 'components/header-cake';

const generateMockData = () => {
	// This is a temporary function to simulate the data that will be gathered from Redux.
	// It's hard-coded to show some of the UI, e.g. what it looks like on a day with no
	// available times.
	const today = moment().startOf( 'day' );
	const tomorrow = moment( today ).add( 1, 'day' );
	const nextDay = moment( today ).add( 2, 'days' );

	return [
		{
			date: today.valueOf(),
			times: [
				today.set( { hour: 9, minute: 30 } ).valueOf(),
				today.set( { hour: 10, minute: 15 } ).valueOf(),
				today.set( { hour: 21, minute: 0 } ).valueOf(),
			],
		},
		{
			date: tomorrow.valueOf(),
			times: [],
		},
		{
			date: nextDay.valueOf(),
			times: [
				nextDay.set( { hour: 7, minute: 0 } ).valueOf(),
				nextDay.set( { hour: 7, minute: 45 } ).valueOf(),
				nextDay.set( { hour: 8, minute: 0 } ).valueOf(),
				nextDay.set( { hour: 13, minute: 15 } ).valueOf(),
			],
		},
	];
};

class CalendarStep extends Component {
	static propTypes = {
		onBack: PropTypes.func.isRequired,
		onComplete: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;
		// TODO: Replace mock data with data from Redux
		const availability = generateMockData();

		return (
			<div>
				<HeaderCake onClick={ this.props.onBack }>
					{ translate( 'Choose Concierge Session' ) }
				</HeaderCake>
				<CompactCard>
					{ translate( 'Please select a day to have your Concierge session.' ) }
				</CompactCard>
				{ availability.map( ( { date, times } ) => (
					<CalendarCard
						date={ date }
						times={ times }
						onSubmit={ this.props.onComplete }
						key={ date }
					/>
				) ) }
			</div>
		);
	}
}

export default localize( CalendarStep );
