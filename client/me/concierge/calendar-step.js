/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import CalendarCard from './calendar-card';
import CompactCard from 'components/card/compact';
import HeaderCake from 'components/header-cake';

class CalendarStep extends Component {
	static propTypes = {
		onBack: PropTypes.func.isRequired,
		onComplete: PropTypes.func.isRequired,
	};

	render() {
		return (
			<div>
				<HeaderCake onClick={ this.props.onBack } />
				<CompactCard>Please select a day to have your Concierge session.</CompactCard>
				<CalendarCard date="2017-11-09" options={ [ 1, 2 ] } onSubmit={ this.props.onComplete } />
				<CalendarCard date="2017-11-10" options={ [] } onSubmit={ this.props.onComplete } />
				<CalendarCard date="2017-11-11" options={ [ 4, 5 ] } onSubmit={ this.props.onComplete } />
			</div>
		);
	}
}

export default CalendarStep;
