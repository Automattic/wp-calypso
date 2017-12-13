/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
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
		const { availableAppointments, translate } = this.props;
		// TODO: Replace mock data with data from Redux
		// const availability = generateMockData();

		return (
			<div>
				<HeaderCake onClick={ this.props.onBack }>
					{ translate( 'Choose Concierge Session' ) }
				</HeaderCake>
				<CompactCard>
					{ translate( 'Please select a day to have your Concierge session.' ) }
				</CompactCard>
				{ availableAppointments.map( ( { date, appointments } ) => (
					<CalendarCard
						date={ date }
						appointments={ appointments }
						onSubmit={ this.props.onComplete }
						key={ date }
					/>
				) ) }
			</div>
		);
	}
}

export default localize( CalendarStep );
